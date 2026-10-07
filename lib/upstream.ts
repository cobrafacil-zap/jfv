/**
 * Resiliência para chamadas a serviços externos (Mercado Pago, Supabase).
 *
 * O MP tem indisponibilidade transitória real: picos de 5xx e 429 acontecem
 * sem aviso. Sem retry, um momentary blip transforma uma venda de R$ 4,99 em
 * "não foi possível pagar" — e o cliente vai embora.
 *
 * Três regras que o resto do projeto segue:
 *
 * 1. **Retry só para o que é transitório.** 4xx não melhora na segunda
 *    tentativa; repetir só gasta cota e atrasa o erro definitivo pro cliente.
 *
 * 2. **Retry exige chave de idempotência.** `POST /v1/payments` cria um
 *    pagamento. Sem `X-Idempotency-Key` estável, um retry pode cobrar a
 *    pessoa duas vezes. Por isso a chave é gerada pelo *cliente* (uma
 *    tentativa = uma chave) e reaproveitada nas retentativas do servidor.
 *    Uma nova tentativa do usuário (ex.: cartão corrigido) gera chave nova,
 *    senão o MP devolveria a resposta em cache da tentativa anterior.
 *
 * 3. **Nunca vazar erro cru.** O log do servidor guarda o detalhe; a resposta
 *    HTTP devolve uma mensagem em português que diz o que fazer.
 */

/** Status que valem uma segunda tentativa. */
const RETRIABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Erro normalizado de um serviço externo, com o status preservado. */
export class UpstreamError extends Error {
  readonly provider: string;
  readonly status: number | null;
  readonly detail: unknown;

  constructor(provider: string, status: number | null, detail?: unknown) {
    super(
      `Upstream ${provider} falhou${status ? ` (HTTP ${status})` : ""}`
    );
    this.name = "UpstreamError";
    this.provider = provider;
    this.status = status;
    this.detail = detail;
  }

  /** `true` quando uma nova tentativa pode resolver. */
  get retriable(): boolean {
    if (this.status === null) return true; // timeout, DNS, conexão cortada
    return RETRIABLE_STATUS.has(this.status);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Extrai o status HTTP de um erro, por cima dos formatos que cada cliente
 * lança. O SDK do MP lança o *corpo* da resposta JSON; `node-fetch` lança
 * `FetchError`; o `fetch` nativo lança `TypeError: fetch failed` com o erro
 * real aninhado em `.cause`.
 */
export function statusOf(error: unknown): number | null {
  const seen = new Set<unknown>();

  const dig = (value: unknown, depth = 0): number | null => {
    if (!isRecord(value) || depth > 4) return null;
    if (seen.has(value)) return null;
    seen.add(value);

    const status = value.status;
    if (typeof status === "number" && status >= 100 && status < 600) {
      return status;
    }

    // MP aninha o erro real em `cause` (às vezes como array) e em `error`
    // (que pode ser string ou objeto).
    const cause = value.cause;
    const candidates: unknown[] = [
      Array.isArray(cause) ? cause[0] : cause,
      value.error,
    ];

    for (const candidate of candidates) {
      const found = dig(candidate, depth + 1);
      if (found !== null) return found;
    }

    return null;
  };

  return dig(error);
}

/** `true` se vale repetir a requisição. */
export function isRetriable(error: unknown): boolean {
  const status = statusOf(error);
  if (status === null) return true;
  return RETRIABLE_STATUS.has(status);
}

/**
 * Texto legível que o MP devolveu, para mostrar ao cliente.
 *
 * O corpo de erro do MP tem este formato:
 *
 * ```json
 * { "message": "caller_id is required",
 *   "error": "bad_request",
 *   "status": 400,
 *   "cause": [{ "code": 4037, "description": "..." }] }
 * ```
 *
 * A mensagem útil está no topo (`message`); `cause` costuma trazer só código
 * e descrição técnica. Por isso olhamos o topo primeiro e usamos a causa
 * apenas como último recurso.
 */
export function upstreamMessage(error: unknown): string | null {
  const candidates: unknown[] = [error];

  if (isRecord(error)) {
    candidates.push(Array.isArray(error.cause) ? error.cause[0] : error.cause);
  }

  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue;

    const direct = candidate.message ?? candidate.description;
    if (typeof direct === "string" && direct.trim()) return direct;

    // `error` pode ser um objeto com o mesmo formato.
    const nested = candidate.error;
    if (isRecord(nested)) {
      const text = nested.message ?? nested.description;
      if (typeof text === "string" && text.trim()) return text;
    }
  }

  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RetryOptions = {
  /** Tentativas totais (1 = sem retry). Padrão: 3. */
  attempts?: number;
  /** Backoff base em ms; dobra a cada tentativa. Padrão: 400. */
  baseMs?: number;
  /** Teto do backoff. Padrão: 3 000. */
  maxMs?: number;
  /** Chamado antes de cada retentativa — bom lugar para log. */
  onRetry?: (attempt: number, error: unknown) => void;
};

/**
 * Executa `fn` repetindo apenas em falha transitória.
 *
 * O backoff é exponencial **com jitter**: sem o fator aleatório, todas as
 * requisições que caíram juntas voltam juntas e derrubam o upstream de novo.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    attempts = 3,
    baseMs = 400,
    maxMs = 3_000,
    onRetry,
  }: RetryOptions = {}
): Promise<T> {
  // `attempts: 0` (ou negativo) não tem resultado útil e faria o `throw`
  // final lançar `undefined`. Trata como uma tentativa só.
  const total = Math.max(1, Math.floor(attempts));

  for (let attempt = 1; attempt <= total; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === total || !isRetriable(error)) throw error;

      onRetry?.(attempt, error);

      // Backoff exponencial com jitter. O fator aleatório é o que impede que
      // todas as requisições que caíram juntas voltem no mesmo instante e
      // derrubem o upstream de novo.
      const ceiling = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
      await sleep(ceiling * (0.5 + Math.random()));
    }
  }

  // inalcançável: o laço só sai por `return` ou `throw`.
  throw new Error("withRetry: saiu do laço sem resultado");
}

/**
 * `AbortSignal` que cancela a requisição depois de `ms`.
 *
 * Sem isso, uma rede travada segura a função da Vercel até o limite dela —
 * e no meio de um pagamento isso significa cliente sem resposta com o
 * cartão já cobrado.
 */
export function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  // Libera o timer se a requisição responder antes: em Node, um timer
  // pendente mantém o event loop vivo.
  if (typeof timer.unref === "function") timer.unref();
  return controller.signal;
}

/**
 * Id de uma tentativa de pagamento, gerado no navegador.
 *
 * Uma tentativa = um id. O servidor transforma isso na chave de idempotência,
 * de modo que retentativa do servidor não duplica o pagamento, mas uma nova
 * tentativa do usuário (cartão corrigido) cria um pagamento novo.
 */
export function newAttemptId(): string {
  const webCrypto: Crypto | undefined =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (webCrypto && typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID();
  }

  // Navegador antigo ou contexto sem `crypto`. Continua sendo único o
  // suficiente para uma janela de checkout.
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/**
 * Monta o `X-Idempotency-Key` do MP a partir do id da tentativa.
 * O MP aceita de 1 a 128 caracteres.
 */
export function mpIdempotencyKey(attemptId: string): string {
  return `jfv-${attemptId}`.slice(0, 128);
}

/**
 * Recusa um id de tentativa ausente ou malformado.
 * Sem ele a chave seria gerada pelo SDK (aleatória a cada chamada) e o retry
 * poderia duplicar o pagamento — então preferimos falhar.
 */
export function isValidAttemptId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9-]{8,128}$/.test(value);
}