import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSiteUrl, getWebhookUrl } from "@/lib/urls";

const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const mpPublicKey = process.env.MERCADOPAGO_PUBLIC_KEY!;
const siteUrl = getSiteUrl();

export { mpPublicKey, siteUrl };

// Cliente server-side do Mercado Pago
export const mpClient = new MercadoPagoConfig({
  accessToken: mpAccessToken,
  options: { timeout: 5000 },
});

const preferenceClient = new Preference(mpClient);

export interface CreatePreferenceParams {
  items: {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }[];
  payer: {
    name?: string;
    email: string;
    phone?: { area_code: string; number: string };
    identification?: { type: string; number: string };
  };
  external_reference: string; // ID do aluno no Supabase
}

export async function createPaymentPreference(params: CreatePreferenceParams) {
  const preference = await preferenceClient.create({
    body: {
      items: params.items,
      payer: params.payer,
      external_reference: params.external_reference,
      back_urls: {
        success: `${siteUrl}/checkout/success`,
        failure: `${siteUrl}/checkout?status=failure`,
        pending: `${siteUrl}/checkout?status=pending`,
      },
      auto_return: "approved",
      notification_url: getWebhookUrl(),
      statement_descriptor: "PRISCILA VIDEOS",
    },
  });

  return preference;
}