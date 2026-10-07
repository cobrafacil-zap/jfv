import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getWebhookUrl } from "@/lib/urls";
import { getCPFForMP } from "@/lib/cpf";
import { isValidAttemptId, isRetriable } from "@/lib/upstream";
import { createPayment } from "@/lib/mercadopago";

const IS_TEST_MODE =
  (process.env.MERCADOPAGO_ACCESS_TOKEN || "").startsWith("TEST-");

// Criação do Pix + gravação no Supabase, com retentativa.
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Pagamento indisponível." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { studentId, email, firstName, lastName, cpf, amount, attemptId } =
      body;

    if (!studentId || !email || !cpf || !amount) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    // Sem chave de idempotência, um retry pode gerar dois QR Codes e o
    // cliente pode pagar o segundo sem saber.
    if (!isValidAttemptId(attemptId)) {
      return NextResponse.json(
        { error: "Sessão do checkout expirada. Recarregue a página." },
        { status: 400 }
      );
    }

    // CPF válido pro MP (em teste, usa CPF de teste se o do cliente for inválido)
    const cpfForMP = getCPFForMP(cpf, IS_TEST_MODE);

    const paymentData: any = {
      transaction_amount: Number(amount),
      description: "Como gravar bons vídeos pelo celular",
      payment_method_id: "pix",
      payer: {
        email,
        first_name: firstName || "",
        last_name: lastName || "",
        identification: {
          type: "CPF",
          number: cpfForMP,
        },
      },
      external_reference: studentId,
      notification_url: getWebhookUrl(),
    };

    const result = await createPayment({ body: paymentData, attemptId });

    console.log("Pix payment result:", {
      id: result.id,
      status: result.status,
    });

    if (!result.id) {
      return NextResponse.json(
        { error: "Erro ao gerar Pix. Tente novamente." },
        { status: 500 }
      );
    }

    // O mesmo pagamento pode chegar aqui por retentativa do servidor (ou pelo
    // webhook repetido): o ID do MP é a chave natural, então gravamos só uma
    // vez em vez de duplicar o lançamento.
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        student_id: studentId,
        mercadopago_payment_id: String(result.id),
        amount: Number(amount),
        status: "pending",
        payment_method: "pix",
      })
      .select();

    if (paymentError && paymentError.code !== "23505") {
      console.error("Supabase payments error:", paymentError);
    }

    return NextResponse.json({
      paymentId: result.id,
      status: result.status,
      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64:
        result.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (error: any) {
    console.error("Create pix error:", error);

    // `isRetriable` acha o HTTP dentro do corpo que o SDK lança. A diferença
    // importa: 503 mantém a tentativa do cliente (que repete com a mesma
    // chave e recebe o mesmo Pix), 502 invalida.
    const retriable = isRetriable(error);
    return NextResponse.json(
      {
        error: retriable
          ? "Não conseguimos gerar o Pix agora. Tente novamente em alguns segundos."
          : "Erro ao gerar Pix. Verifique os dados e tente novamente.",
      },
      retriable
        ? { status: 503, headers: { "Retry-After": "5" } }
        : { status: 502 }
    );
  }
}
