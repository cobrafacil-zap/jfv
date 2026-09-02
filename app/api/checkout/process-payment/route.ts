import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase";
import { getWebhookUrl } from "@/lib/urls";

export async function POST(req: Request) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { status: "rejected", message: "Pagamento indisponível." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { formData, studentId } = body;

    if (!formData || !studentId) {
      return NextResponse.json(
        { status: "rejected", message: "Dados incompletos." },
        { status: 400 }
      );
    }

    // Cria o pagamento via MP API
    const paymentClient = new Payment(mpClient);

    // formData vem do Brick e contém:
    // - token (do cartão) ou qr_code (Pix) ou payment_method_id
    // - issuer_id
    // - payer (com email, identification, etc)
    // - transaction_amount
    // - installments

    const paymentData: any = {
      transaction_amount: formData.transaction_amount,
      token: formData.token,
      description: "Como gravar bons vídeos pelo celular",
      installments: formData.installments || 1,
      payment_method_id: formData.payment_method_id,
      issuer_id: formData.issuer_id,
      payer: {
        email: formData.payer?.email,
        first_name: formData.payer?.first_name,
        last_name: formData.payer?.last_name,
        identification: formData.payer?.identification,
      },
      external_reference: studentId,
      notification_url: getWebhookUrl(),
    };

    // Se for Pix, usa payment_method_id = "pix"
    if (formData.payment_method_id === "pix") {
      paymentData.payment_method_id = "pix";
      paymentData.token = undefined;
    }

    const result = await paymentClient.create({ body: paymentData });

    console.log("Payment result:", {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
    });

    // Salva o pagamento no Supabase
    if (result.status === "approved" || result.status === "pending") {
      await supabaseAdmin.from("payments").insert({
        student_id: studentId,
        mercadopago_payment_id: String(result.id),
        amount: result.transaction_amount || 0,
        status: result.status,
        payment_method: result.payment_method_id,
        paid_at: result.status === "approved" ? new Date().toISOString() : null,
      });

      // Atualiza o aluno
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
      return NextResponse.json({
        status: "approved",
        id: result.id,
      });
    } else {
      return NextResponse.json({
        status: "rejected",
        message:
          result.status_detail === "cc_rejected_other_reason"
            ? "Pagamento rejeitado. Verifique os dados do cartão."
            : `Pagamento ${result.status}. Tente novamente.`,
      });
    }
  } catch (error: any) {
    console.error("Process payment error:", error);
    return NextResponse.json(
      {
        status: "rejected",
        message: "Erro ao processar pagamento. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
