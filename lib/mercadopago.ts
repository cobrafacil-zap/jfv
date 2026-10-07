import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSiteUrl, getWebhookUrl } from "@/lib/urls";
import { withRetry, mpIdempotencyKey } from "@/lib/upstream";

const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const mpPublicKey = process.env.MERCADOPAGO_PUBLIC_KEY!;
const siteUrl = getSiteUrl();

export { mpPublicKey, siteUrl };

/**
 * O SDK 2.13.0 aceita `retries` em runtime (o RestClient lê a propriedade),
 * mas não declara o campo no tipo `Options` — daí o cast.
 *
 * Colocamos `1` para **desligar** o retry interno do SDK e assumir o
 * controle em `withRetry`. Motivos:
 *
 * - o retry do SDK não tem jitter, então todas as requisições que caíram
 *   juntas voltam juntas;
 * - ele só olha `status >= 500` e ignora 429 (limite de taxa);
 * - somar as duas camadas multiplicaria as tentativas e estouraria o
 *   tempo limite da função da Vercel no meio de um pagamento.
 */
type MpOptions = { timeout?: number; idempotencyKey?: string; retries?: number };

export const mpClient = new MercadoPagoConfig({
  accessToken: mpAccessToken,
  // 5s era curto demais: o MP costuma responder entre 1s e 3s, mas em pico
  // passa de 5s e a requisição morria antes da resposta — o mesmo sintoma
  // de "endpoint indisponível".
  options: { timeout: 8_000, retries: 1 } as MpOptions,
});

const preferenceClient = new Preference(mpClient);

/**
 * Teto de tempo das retentativas + timeout por tentativa.
 *
 * 8s x 2 tentativas + ~1s de backoff fica perto de 17s. Se a função da Vercel
 * for morta no meio do pagamento, o cartão pode já ter sido cobrado e o
 * cliente nunca recebe o ID — por isso as rotas de checkout exportam
 * `maxDuration` maior. Não aumente `attempts` sem revisar esse valor.
 */
const RETRY = { attempts: 2, baseMs: 400, maxMs: 1_200 } as const;

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
  /** Id da tentativa, vindo do navegador. Vira a chave de idempotência. */
  attemptId: string;
}

export async function createPaymentPreference(params: CreatePreferenceParams) {
  const idempotencyKey = mpIdempotencyKey(params.attemptId);

  return withRetry(
    () =>
      preferenceClient.create({
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
        // Mesma chave em toda tentativa: se a 1ª requisição chegou no MP e a
        // resposta se perdeu, a 2ª devolve a preferência original em vez de
        // criar uma segunda.
        requestOptions: { idempotencyKey, timeout: 8_000 },
      }),
    {
      ...RETRY,
      onRetry: (attempt, error) =>
        console.warn(`[mp] preferência: tentativa ${attempt} falhou, repetindo`, error),
    }
  );
}

/**
 * Cria um pagamento (cartão ou Pix).
 *
 * Idempotente por `attemptId`: o retry do servidor nunca vira segunda
 * cobrança, e uma nova tentativa do cliente — com outro cartão, por exemplo —
 * vira um pagamento novo.
 */
export async function createPayment(params: {
  /** Corpo enviado ao `POST /v1/payments`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  attemptId: string;
}) {
  const idempotencyKey = mpIdempotencyKey(params.attemptId);

  return withRetry(
    async () => {
      const { Payment } = await import("mercadopago");
      return new Payment(mpClient).create({
        body: params.body,
        requestOptions: { idempotencyKey, timeout: 8_000 },
      });
    },
    {
      ...RETRY,
      onRetry: (attempt, error) =>
        console.warn(`[mp] pagamento: tentativa ${attempt} falhou, repetindo`, error),
    }
  );
}

/** Consulta o status de um pagamento. Leitura pura: retry é seguro. */
export async function getPayment(paymentId: number | string) {
  const { Payment } = await import("mercadopago");
  const client = new Payment(mpClient);

  return withRetry(
    () => client.get({ id: String(paymentId) }),
    {
      attempts: 3,
      baseMs: 300,
      maxMs: 1_000,
      onRetry: (attempt) =>
        console.warn(`[mp] consulta ${paymentId}: tentativa ${attempt} falhou`),
    }
  );
}