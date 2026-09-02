import { NextResponse } from "next/server";
import { mpClient } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { getWebhookUrl } from "@/lib/urls";
import { isValidCPF, getCPFForMP } from "@/lib/cpf";

const IS_TEST_MODE =
  (process.env.MERCADOPAGO_ACCESS_TOKEN || "").startsWith("TEST-");

export async function POST(req: Request) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Pagamento indisponível." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { studentId, email, firstName, lastName, cpf, amount } = body;

    if (!studentId || !email || !cpf || !amount) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    const { Payment } = await import("mercadopago");
    const paymentClient = new Payment(mpClient);

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

    const result = await paymentClient.create({ body: paymentData });

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

    // Salva pagamento pendente
    await supabaseAdmin.from("payments").insert({
      student_id: studentId,
      mercadopago_payment_id: String(result.id),
      amount: Number(amount),
      status: "pending",
      payment_method: "pix",
    });

    return NextResponse.json({
      paymentId: result.id,
      status: result.status,
      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64:
        result.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (error: any) {
    console.error("Create pix error:", error);
    return NextResponse.json(
      {
        error:
          error?.message || "Erro ao gerar Pix. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
