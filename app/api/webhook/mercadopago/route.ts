import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/urls";

interface MercadoPagoWebhookBody {
  type?: string;
  data?: {
    id?: string | number;
  };
}

export async function POST(req: Request) {
  try {
    const body: MercadoPagoWebhookBody = await req.json();

    // MP envia notificações de pagamento
    if (body.type === "payment" && body.data?.id) {
      const paymentId = String(body.data.id);

      // Buscar detalhes do pagamento na API do MP
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!mpResponse.ok) {
        console.error("Erro ao buscar pagamento no MP:", mpResponse.status);
        return NextResponse.json({ ok: false }, { status: 200 });
      }

      const payment = await mpResponse.json();

      // external_reference é o ID do aluno no Supabase
      const studentId = payment.external_reference;
      const status = payment.status; // approved, pending, rejected, etc.

      if (!studentId) {
        console.warn("Pagamento sem external_reference:", paymentId);
        return NextResponse.json({ ok: true });
      }

      // Atualizar status do aluno no Supabase
      const newStatus =
        status === "approved"
          ? "active"
          : status === "rejected" || status === "cancelled"
          ? "cancelled"
          : "pending";

      const { error } = await supabaseAdmin
        .from("students")
        .update({
          status: newStatus,
          mercadopago_payment_id: paymentId,
          amount_paid: payment.transaction_amount || 0.10,
          accessed_at: newStatus === "active" ? new Date().toISOString() : null,
        })
        .eq("id", studentId);

      if (error) {
        console.error("Erro ao atualizar aluno:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
      }

      console.log(
        `Aluno ${studentId} atualizado para status: ${newStatus}`
      );

      // Se pagamento aprovado, criar user no Supabase Auth + enviar magic link
      if (newStatus === "active") {
        try {
          // Usa o helper que respeita NEXT_PUBLIC_SITE_URL
          // (e cai pro domínio de produção como fallback)
          const baseUrl = getSiteUrl();

          const createUserResponse = await fetch(
            `${baseUrl}/api/auth/create-student-user`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId }),
            }
          );

          if (!createUserResponse.ok) {
            console.error(
              "Erro ao criar user Supabase:",
              await createUserResponse.text()
            );
          } else {
            const data = await createUserResponse.json();
            console.log(
              `User Supabase criado/vinculado para aluno ${studentId}:`,
              data.message
            );
            console.log(`[webhook] Magic link gerado:`, data.magicLink);
            console.log(`[webhook] Site URL:`, data.siteUrl);
          }
        } catch (err) {
          console.error("Erro ao chamar create-student-user:", err);
        }
      }
    }

    // Responder 200 para o MP não reenviar
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// MP também pode enviar GETs para validar o endpoint
export async function GET() {
  return NextResponse.json({ ok: true });
}