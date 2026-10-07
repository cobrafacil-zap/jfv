import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getWebhookUrl } from "@/lib/urls";
import { isValidAttemptId, isRetriable, upstreamMessage } from "@/lib/upstream";
import { createPayment } from "@/lib/mercadopago";

// Cobrança + gravações no Supabase, com retentativa. O limite da função
// precisa caber 2 x 8s de tentativa mais o backoff, senão a Vercel mata a
// requisição com o cartão já cobrado do lado do MP.
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel");
      return NextResponse.json(
        { status: "rejected", message: "Pagamento indisponível." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { studentId, card, payer, installments, amount, attemptId } = body;

    // Sem chave de idempotência, a retentativa pode cobrar o cartão duas
    // vezes. É o pior erro possível aqui, então recusamos o pedido.
    if (!isValidAttemptId(attemptId)) {
      return NextResponse.json(
        {
          status: "rejected",
          message: "Sessão do checkout expirada. Recarregue a página.",
        },
        { status: 400 }
      );
    }

    if (!studentId || !card || !payer || !amount) {
      return NextResponse.json(
        { status: "rejected", message: "Dados incompletos." },
        { status: 400 }
      );
    }

    if (!card.token) {
      console.error("card.token ausente no body:", { card });
      return NextResponse.json(
        {
          status: "rejected",
          message: "Não foi possível tokenizar o cartão. Tente novamente.",
        },
        { status: 400 }
      );
    }

    if (!card.payment_method_id) {
      return NextResponse.json(
        {
          status: "rejected",
          message: "Selecione a bandeira do cartão.",
        },
        { status: 400 }
      );
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        {
          status: "rejected",
          message: "Valor do pagamento inválido.",
        },
        { status: 400 }
      );
    }

    const paymentData: any = {
      transaction_amount: Number(amount),
      token: card.token,
      description: "Como gravar bons vídeos pelo celular",
      installments: Number(installments) || 1,
      payment_method_id: card.payment_method_id,
      issuer_id: card.issuer_id,
      payer: {
        email: payer.email,
        first_name: payer.firstName,
        last_name: payer.lastName,
        identification: payer.identification,
      },
      external_reference: studentId,
      notification_url: getWebhookUrl(),
    };

    const result = await createPayment({ body: paymentData, attemptId });

    console.log("Card payment result:", {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
    });

    // Salva pagamento no Supabase.
    //
    // Este `insert` pode rodar mais de uma vez para o mesmo pagamento: a
    // retentativa do servidor devolve o mesmo resultado (idempotência), e o
    // webhook também grava. `23505` aqui significa "já estava salvo", que é
    // o estado desejado — não um erro.
    if (
      result.status === "approved" ||
      result.status === "pending" ||
      result.status === "in_process"
    ) {
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          student_id: studentId,
          mercadopago_payment_id: String(result.id),
          amount: result.transaction_amount || Number(amount),
          status: result.status,
          payment_method: result.payment_method_id,
          paid_at: result.status === "approved" ? new Date().toISOString() : null,
        })
        .select();

      if (paymentError && paymentError.code !== "23505") {
        console.error("Supabase payments error:", paymentError);
      }

      if (result.status === "approved") {
        await supabaseAdmin
          .from("students")
          .update({
            status: "active",
            mercadopago_payment_id: String(result.id),
            accessed_at: new Date().toISOString(),
          })
          .eq("id", studentId);
      }
    }

    if (result.status === "approved") {
      return NextResponse.json({ status: "approved", id: result.id });
    }

    if (result.status === "pending" || result.status === "in_process") {
      return NextResponse.json({
        status: result.status,
        id: result.id,
      });
    }

    // rejected / cancelled / qualquer outro
    let userMessage = "Pagamento rejeitado. Verifique os dados do cartão.";
    const sd = result.status_detail;
    if (sd === "cc_rejected_insufficient_amount") {
      userMessage = "Saldo insuficiente no cartão.";
    } else if (sd === "cc_rejected_bad_filled_security_code") {
      userMessage = "Código de segurança (CVV) incorreto.";
    } else if (sd === "cc_rejected_bad_filled_date") {
      userMessage = "Data de validade incorreta.";
    } else if (sd === "cc_rejected_bad_filled_card_number") {
      userMessage = "Número do cartão incorreto.";
    } else if (sd === "cc_rejected_high_risk") {
      userMessage = "Pagamento recusado por segurança. Tente outro cartão.";
    } else if (sd === "cc_rejected_call_for_authorize") {
      userMessage = "É necessário autorizar o pagamento junto à operadora.";
    }
    return NextResponse.json(
      { status: "rejected", message: userMessage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Process card error:", error);

    // Distingue "recusou o cartão" de "o serviço caiu". A diferença importa:
    // no primeiro caso insistir não adianta e a culpa é dos dados; no segundo
    // o cliente precisa só esperar alguns segundos.
    const retriable = isRetriable(error);
    const statusDetail = error?.status_detail || error?.cause?.[0]?.status_detail;

    let userMessage: string;

    if (statusDetail === "cc_rejected_other_reason") {
      userMessage = "Pagamento rejeitado. Verifique os dados do cartão.";
    } else if (retriable) {
      userMessage =
        "O serviço de pagamento não respondeu agora. Seu cartão não foi cobrado — tente de novo em alguns segundos.";
    } else {
      // Mensagem legível do MP, sem o payload cru.
      const mpMessage = upstreamMessage(error);
      userMessage = mpMessage
        ? `Pagamento recusado: ${mpMessage}`
        : "Pagamento rejeitado. Verifique os dados do cartão.";
    }

    // 503 + Retry-After para falha transitória: orienta tanto o app quanto o
    // proxy, e impede que o cliente trate isso como recusa definitiva do
    // cartão.
    return NextResponse.json(
      { status: "rejected", message: userMessage },
      retriable
        ? { status: 503, headers: { "Retry-After": "5" } }
        : { status: 200 }
    );
  }
}
