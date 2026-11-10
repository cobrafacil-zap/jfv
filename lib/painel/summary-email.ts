import { Resend } from "resend";

/* ============================================================
   Resumo diário por email.

   Enviado pelo cron da Vercel (`/api/cron/summary`).
   Variáveis: RESEND_API_KEY, CRON_SECRET e, opcionalmente,
   PAINEL_SUMMARY_EMAIL e RESEND_FROM.
   ============================================================ */

const DESTINO_PADRAO = "contatocomercialsocial@gmail.com";
const REMETENTE_PADRAO = "Priscila Sinópolis <contato@smdigtal.com>";

export type DailySummary = {
  date: string;
  pageviews: number;
  visitors: number;
  programClicks: number;
  whatsappClicks: number;
  formSubmits: number;
  conversionRate: number;
  leadsTotal: number;
  leadsMentoria: number;
  leadsAceleracao: number;
  monthLeads: number;
  goal: number | null;
};

export type SummaryResult = {
  ok: boolean;
  status: "sent" | "not_configured" | "rejected" | "error";
};

function formatDateBR(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

function number(value: number): string {
  return value.toLocaleString("pt-BR");
}

function percent(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function escapar(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendDailySummary(
  summary: DailySummary
): Promise<SummaryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resumo] RESEND_API_KEY não configurada.");
    return { ok: false, status: "not_configured" };
  }

  const dateLabel = formatDateBR(summary.date);
  const goalLine =
    summary.goal && summary.goal > 0
      ? `${number(summary.monthLeads)} de ${number(summary.goal)} leads no mês (${percent(
          Math.min(100, (summary.monthLeads / summary.goal) * 100)
        )})`
      : `${number(summary.monthLeads)} leads no mês`;

  const linhas = [
    ["Visitas na página", number(summary.pageviews)],
    ["Pessoas diferentes", number(summary.visitors)],
    ["Cliques nos programas", number(summary.programClicks)],
    ["Chamadas no WhatsApp", number(summary.whatsappClicks)],
    ["Formulários preenchidos", number(summary.formSubmits)],
    ["Taxa de conversão", percent(summary.conversionRate)],
    ["Leads salvos", number(summary.leadsTotal)],
    ["Do Zero aos 10k", number(summary.leadsMentoria)],
    ["Aceleração Comercial", number(summary.leadsAceleracao)],
  ];

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#0e0a06;font-family:Arial,Helvetica,sans-serif;color:#f8f4ec;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e0a06;padding:28px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#17110b;border:1px solid #2c2118;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:26px 28px 18px;border-bottom:1px solid #2c2118;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e88e58;">Método JFV</p>
                <h1 style="margin:0;font-size:22px;line-height:1.25;color:#f8f4ec;">Resumo de ${escapar(dateLabel)}</h1>
                <p style="margin:8px 0 0;font-size:13px;color:#b9ada0;">Um retrato do dia anterior na landing.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${linhas
                    .map(
                      ([rotulo, valor]) => `<tr>
                    <td style="padding:9px 0;border-bottom:1px solid #241b14;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:#a99b8d;">${escapar(
                      rotulo
                    )}</td>
                    <td style="padding:9px 0;border-bottom:1px solid #241b14;text-align:right;font-size:16px;font-weight:700;color:#f8f4ec;">${escapar(
                      valor
                    )}</td>
                  </tr>`
                    )
                    .join("")}
                </table>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#b9ada0;">
                  Meta do mês: <strong style="color:#f8f4ec;">${escapar(goalLine)}</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px;">
                <a href="https://jfv.smdigtal.com/painel" style="display:inline-block;background:#e88e58;color:#1a0f06;font-weight:700;font-size:13px;text-decoration:none;padding:11px 18px;border-radius:999px;">Abrir o painel</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Resumo de ${dateLabel}`,
    "",
    ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    "",
    `Meta do mês: ${goalLine}`,
    "",
    "Painel: https://jfv.smdigtal.com/painel",
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || REMETENTE_PADRAO,
      to:
        process.env.PAINEL_SUMMARY_EMAIL ||
        process.env.LEADS_NOTIFICATION_EMAIL ||
        DESTINO_PADRAO,
      subject: `Resumo JFV · ${dateLabel}`,
      html,
      text,
    });

    if (error) {
      console.warn("[resumo] Resend recusou o envio:", error.message);
      return { ok: false, status: "rejected" };
    }

    return { ok: true, status: "sent" };
  } catch (error) {
    console.warn("[resumo] erro ao enviar o resumo:", error);
    return { ok: false, status: "error" };
  }
}
