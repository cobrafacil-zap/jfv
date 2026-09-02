// Helper para montar URLs válidas pro Mercado Pago / Supabase Auth
// Garante que SEMPRE tem https:// e não tem barra no final nem caracteres estranhos

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.MERCADOPAGO_WEBHOOK_URL?.replace("/api/webhook/mercadopago", "") ||
    "https://jeitofacildevender.online";

  // Limpa caracteres invisíveis, espaços e quebras de linha
  let url = raw
    .trim()                          // remove espaços nas pontas
    .replace(/\s/g, "")              // remove TODOS os espaços em branco
    .replace(/[​-‍﻿]/g, ""); // remove zero-width chars (BOM, etc.)

  // Garante que começa com https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // Remove barra final
  url = url.replace(/\/$/, "");

  return url;
}

export function getWebhookUrl(): string {
  // Se tem MERCADOPAGO_WEBHOOK_URL completo, usa ele
  if (
    process.env.MERCADOPAGO_WEBHOOK_URL &&
    process.env.MERCADOPAGO_WEBHOOK_URL.startsWith("http")
  ) {
    return process.env.MERCADOPAGO_WEBHOOK_URL.trim().replace(/\s/g, "");
  }

  // Senão monta a partir do SITE_URL
  return `${getSiteUrl()}/api/webhook/mercadopago`;
}