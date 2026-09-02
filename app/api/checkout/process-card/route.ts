import { NextResponse } from "next/server";
import { mpClient } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { getWebhookUrl } from "@/lib/urls";
import { getCPFForMP } from "@/lib/cpf";

const IS_TEST_MODE =
  (process.env.MERCADOPAGO_ACCESS_TOKEN || "").startsWith("TEST-");

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
    const { studentId, card, payer, installments, amount } = body;

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

    let paymentClient;
    try {
      const { Payment } = await import("mercadopago");
      paymentClient = new Payment(mpClient);
    } catch (sdkErr: any) {
      console.error("Falha ao instanciar SDK do MP:", sdkErr);
      return NextResponse.json(
        {
          status: "rejected",
          message: "Serviço de pagamento temporariamente indisponível.",
        },
        { status: 503 }
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

    const result = await paymentClient.create({ body: paymentData }).catch((err) => {
      console.error("MercadoPago card error (raw):", err);
      throw err;
    });

    console.log("Card payment result:", {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
    });

    // Salva pagamento no Supabase
    if (
      result.status === "approved" ||
      result.status === "pending" ||
      result.status === "in_process"
    ) {
      await supabaseAdmin.from("payments").insert({
        student_id: studentId,
        mercadopago_payment_id: String(result.id),
        amount: result.transaction_amount || Number(amount),
        status: result.status,
        payment_method: result.payment_method_id,
        paid_at: result.status === "approved" ? new Date().toISOString() : null,
      });

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
    // Tenta extrair a mensagem real do erro do MP para o usuário
    let userMessage = "Erro ao processar pagamento. Tente novamente.";

    // Diferentes formatos que o SDK/MP podem retornar
    const apiError =
      error?.cause?.[0]?.error ||
      error?.cause ||
      error?.error ||
      error;
    const mpMessage =
      apiError?.message ||
      apiError?.error?.message ||
      apiError?.description;
    const statusDetail =
      apiError?.status_detail ||
      apiError?.cause?.[0]?.status_detail;

    if (statusDetail === "cc_rejected_other_reason") {
      userMessage = "Pagamento rejeitado. Verifique os dados do cartão.";
    } else if (mpMessage && typeof mpMessage === "string") {
      userMessage = `Pagamento recusado: ${mpMessage}`;
    }

    return NextResponse.json(
      {
        status: "rejected",
        message: userMessage,
        debug: {
          mpMessage,
          statusDetail,
          errorMessage: error?.message,
          cause: error?.cause?.[0] ?? null,
        },
      },
      { status: 500 }
    );
  }
}
