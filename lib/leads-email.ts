import { Resend } from "resend";

/**
 * Notificação por email dos leads dos formulários.
 *
 * Variáveis de ambiente:
 * - RESEND_API_KEY (obrigatória)
 * - RESEND_FROM (opcional; padrão usa o domínio já verificado)
 * - LEADS_NOTIFICATION_EMAIL (opcional; padrão contatocomercialsocial@gmail.com)
 */

const DESTINO_PADRAO = "contatocomercialsocial@gmail.com";
const REMETENTE_PADRAO =
  "Priscila Sinópolis <contato@jeitofacildevender.online>";

type Lead = Record<string, unknown>;

export type CampoLead = { rotulo: string; chave: string };

function texto(valor: unknown): string {
  if (Array.isArray(valor)) return valor.filter(Boolean).join(", ");
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

function escaparHtml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatarData(iso: unknown) {
  const data = typeof iso === "string" ? new Date(iso) : new Date();
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

export async function enviarEmailLead(params: {
  assunto: string;
  lead: Lead;
  campos: CampoLead[];
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[leads-email] RESEND_API_KEY não configurada.");
    return false;
  }

  const linhas = params.campos
    .map((campo) => ({ rotulo: campo.rotulo, valor: texto(params.lead[campo.chave]) }))
    .filter((linha) => linha.valor.length > 0);

  if (linhas.length === 0) return false;

  const recebidoEm = formatarData(params.lead.recebido_em);
  const emailLead = texto(params.lead.email);
  const nome = texto(params.lead.nome) || "Lead";

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
                <h1 style="margin:0;font-size:22px;line-height:1.25;color:#f8f4ec;">${escaparHtml(params.assunto)}</h1>
                <p style="margin:8px 0 0;font-size:13px;color:#b9ada0;">Recebido em ${escaparHtml(recebidoEm)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${linhas
                    .map(
                      (linha) => `<tr>
                    <td style="padding:9px 0;border-bottom:1px solid #241b14;vertical-align:top;width:38%;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:#a99b8d;">${escaparHtml(linha.rotulo)}</td>
                    <td style="padding:9px 0 9px 14px;border-bottom:1px solid #241b14;vertical-align:top;font-size:15px;line-height:1.5;color:#f8f4ec;">${escaparHtml(linha.valor)}</td>
                  </tr>`
                    )
                    .join("")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#b9ada0;">
                  Responda este email para falar direto com ${escaparHtml(nome)}${
                    emailLead ? ` (${escaparHtml(emailLead)})` : ""
                  }.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    params.assunto,
    `Recebido em ${recebidoEm}`,
    "",
    ...linhas.map((linha) => `${linha.rotulo}: ${linha.valor}`),
    "",
    `Responda este email para falar com ${nome}${emailLead ? ` (${emailLead})` : ""}.`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || REMETENTE_PADRAO,
      to: process.env.LEADS_NOTIFICATION_EMAIL || DESTINO_PADRAO,
      replyTo: emailLead || undefined,
      subject: params.assunto,
      html,
      text,
    });

    if (error) {
      console.warn("[leads-email] Resend recusou o envio:", error.message);
      return false;
    }

    return true;
  } catch (erro) {
    console.warn("[leads-email] erro ao enviar notificação:", erro);
    return false;
  }
}
