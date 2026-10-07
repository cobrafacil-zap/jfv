import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/urls";
import {
  withRetry,
  isRetriable,
  statusOf,
  timeoutSignal,
} from "@/lib/upstream";

// O webhook precisa de folga: ele busca o pagamento no MP, grava no Supabase
// e chama a criação do usuário de acesso. Sem isso a Vercel mata a função no
// meio e o pagamento aprovado nunca libera o curso.
export const maxDuration = 30;

interface MercadoPagoWebhookBody {
  type?: string;
  data?: {
    id?: string | number;
  };
}

/** Valor de `amount_paid` quando o MP não devolve o valor. */
const FALLBACK_AMOUNT = 0.10;

export async function POST(req: Request) {
  // Declarado fora do `try` para o log do `catch` conseguir citar o
  // pagamento mesmo quando o corpo nem chegou a ser lido.
  let paymentId: string | null = null;

  try {
    const body: MercadoPagoWebhookBody = await req.json();

    if (body.type !== "payment" || !body.data?.id) {
      // Notificação que não é de pagamento: nada a fazer, e 200 evita
      // reenvio desnecessário.
      return NextResponse.json({ ok: true });
    }

    paymentId = String(body.data.id);
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN ausente no webhook");
      // 500 de propósito: o MP reenvia quando o token voltar a existir.
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // Busca o pagamento com timeout e retry. É leitura pura, então repetir é
    // seguro e não duplica nada.
    const payment = await withRetry(
      async () => {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            // Sem isto, uma rede travada segura a função até a Vercel cortar.
            signal: timeoutSignal(8_000),
          }
        );

        if (!mpResponse.ok) {
          throw Object.assign(new Error("MP recusou a consulta"), {
            status: mpResponse.status,
          });
        }

        return mpResponse.json();
      },
      {
        attempts: 3,
        baseMs: 300,
        maxMs: 1_500,
        onRetry: (attempt, error) =>
          console.warn(
            `[webhook] ${paymentId}: busca no MP falhou (tentativa ${attempt}, status ${statusOf(error)}), repetindo`
          ),
      }
    );

    // external_reference é o ID do aluno no Supabase
    const studentId = payment.external_reference;
    const status = payment.status; // approved, pending, rejected, etc.

    if (!studentId) {
      console.warn("Pagamento sem external_reference:", paymentId);
      return NextResponse.json({ ok: true });
    }

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
        amount_paid: payment.transaction_amount || FALLBACK_AMOUNT,
        accessed_at: newStatus === "active" ? new Date().toISOString() : null,
      })
      .eq("id", studentId);

    if (error) {
      console.error("Erro ao atualizar aluno:", error);
      // 500 para o MP reenviar: perder esta atualização significa cliente
      // pagou e não recebeu acesso.
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    console.log(`Aluno ${studentId} atualizado para status: ${newStatus}`);

    if (newStatus === "active") {
      await grantAccess(studentId);
    }

    // Só 200 quando o trabalho foi realmente feito.
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);

    // Regra do MP: 2xx = "entregue, não reenvia". Qualquer outra coisa faz o
    // MP repetir.
    //
    // A versão anterior devolvia 200 mesmo quando a busca no MP falhava — o
    // pagamento ficava aprovado lá e o aluno nunca era liberado, porque o MP
    // entendia que a entrega tinha sido feita. Agora a falha transitória
    // devolve 503 e força o reenvio.
    if (!isRetriable(error)) {
      // Recusa definitiva (404 = pagamento inexistente ou de outra conta,
      // 401 = token inválido). Repetir não muda nada, então 200 encerra a
      // notificação.
      console.error(
        `[webhook] ${paymentId ?? "?"}: erro definitivo do MP (status ${statusOf(
          error
        )}); notificação encerrada`
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

/**
 * Cria o usuário de acesso e envia o magic link.
 *
 * Idempotente por construção: `create-student-user` sai cedo se o aluno já
 * tem `auth_user_id`, então o reenvio do webhook não gera e-mails duplicados.
 * Falha aqui não invalida o webhook — o aluno já está `active` no banco e
 * pode pedir o link de novo pelo painel.
 */
async function grantAccess(studentId: string) {
  try {
    const baseUrl = getSiteUrl();

    const createUserResponse = await fetch(
      `${baseUrl}/api/auth/create-student-user`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
        signal: timeoutSignal(15_000),
      }
    );

    if (!createUserResponse.ok) {
      console.error(
        "Erro ao criar user Supabase:",
        await createUserResponse.text()
      );
      return;
    }

    const data = await createUserResponse.json();
    console.log(
      `User Supabase criado/vinculado para aluno ${studentId}:`,
      data.message
    );
    console.log("[webhook] Magic link gerado:", data.magicLink);
    console.log("[webhook] Site URL:", data.siteUrl);
  } catch (err) {
    console.error("Erro ao chamar create-student-user:", err);
  }
}

// MP também pode enviar GETs para validar o endpoint
export async function GET() {
  return NextResponse.json({ ok: true });
}