import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";
import { addDays, dayStartISO, localDay, todayLocal } from "./time";
import type { EventQuery, StoreMode, StoredEvent } from "./types";

/* ============================================================
   Armazenamento dos eventos de analytics.

   Ordem de preferência:
   1. Tabela dedicada `analytics_events` (recomendada)
   2. Key/value em `site_settings` (funciona sem rodar SQL)
   3. Arquivo JSON local (somente desenvolvimento)

   A tabela dedicada é detectada automaticamente. Enquanto ela não
   existir, o painel usa a tabela `site_settings` que já está em
   produção — assim o rastreamento funciona desde o primeiro deploy.
   ============================================================ */

const TABLE = "analytics_events";
const KV_TABLE = "site_settings";
const KV_PREFIX = "analytics:evt:";
const PAGE_SIZE = 1000;
const MAX_EVENTS = 100_000;
const FILE_PATH =
  process.env.ANALYTICS_FILE || path.join(process.cwd(), ".data", "analytics.json");

let modePromise: Promise<StoreMode> | null = null;
let fileLock: Promise<unknown> = Promise.resolve();

function hasSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Detecta se a tabela dedicada existe com uma leitura real.
 * HEAD/count não é confiável: o PostgREST pode responder sem corpo e o
 * client interpretar como sucesso mesmo quando a tabela não existe.
 */
async function detectMode(): Promise<StoreMode> {
  if (!hasSupabase()) return "file";

  try {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .select("event_type")
      .limit(1);

    return error ? "kv" : "table";
  } catch {
    // Cai para o KV se a tabela não existir ou a consulta falhar.
    return "kv";
  }
}

export function getStoreMode(): Promise<StoreMode> {
  if (!modePromise) {
    modePromise = detectMode().catch(() => "kv");
  }
  return modePromise;
}

function forceKvMode() {
  modePromise = Promise.resolve("kv");
}

/** Identifica erros de tabela ausente para trocar para o KV sem quebrar. */
function isMissingTableError(error: unknown): boolean {
  if (!error) return false;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error);

  const normalized = message.toLowerCase();

  return (
    code === "PGRST205" ||
    code === "42P01" ||
    normalized.includes("could not find the table") ||
    normalized.includes("does not exist")
  );
}

/** Detecta coluna ausente (schema antigo) para reinserir sem o campo novo. */
function isMissingColumnError(error: unknown, column: string): boolean {
  if (!error) return false;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error);

  const normalized = message.toLowerCase();

  return (
    code === "42703" ||
    code === "PGRST204" ||
    normalized.includes(`'${column.toLowerCase()}' column`) ||
    normalized.includes(`column "${column.toLowerCase()}"`)
  );
}

/* ============================================================
   Chaves do KV
   ============================================================ */

function kvKey(event: StoredEvent): string {
  const prefix = event.demo ? `${KV_PREFIX}demo:` : KV_PREFIX;
  return `${prefix}${event.day}:${randomUUID()}`;
}

function toTableRow(event: StoredEvent) {
  return {
    event_type: event.type,
    visitor_id: event.visitorId,
    session_id: event.sessionId ?? null,
    page: event.page ?? null,
    program_id: event.programId ?? null,
    program_name: event.programName ?? null,
    form_id: event.formId ?? null,
    placement: event.placement ?? null,
    depth: event.depth ?? null,
    utm_source: event.utmSource ?? null,
    utm_medium: event.utmMedium ?? null,
    utm_campaign: event.utmCampaign ?? null,
    referrer: event.referrer ?? null,
    device: event.device ?? null,
    event_ts: event.ts,
  };
}

function fromTableRow(row: Record<string, unknown>): StoredEvent {
  const ts = String(row.event_ts ?? new Date().toISOString());
  return {
    type: row.event_type as StoredEvent["type"],
    visitorId: String(row.visitor_id ?? ""),
    sessionId: (row.session_id as string | null) ?? undefined,
    page: (row.page as string | null) ?? undefined,
    programId: (row.program_id as string | null) ?? undefined,
    programName: (row.program_name as string | null) ?? undefined,
    formId: (row.form_id as string | null) ?? undefined,
    placement: (row.placement as string | null) ?? undefined,
    depth:
      typeof row.depth === "number"
        ? row.depth
        : row.depth != null && row.depth !== ""
        ? Number(row.depth)
        : undefined,
    utmSource: (row.utm_source as string | null) ?? undefined,
    utmMedium: (row.utm_medium as string | null) ?? undefined,
    utmCampaign: (row.utm_campaign as string | null) ?? undefined,
    referrer: (row.referrer as string | null) ?? undefined,
    device: (row.device as StoredEvent["device"]) ?? undefined,
    ts,
    day: localDay(ts),
  };
}

function isStoredEvent(value: unknown): value is StoredEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<StoredEvent>;
  return (
    typeof event.type === "string" &&
    typeof event.visitorId === "string" &&
    typeof event.ts === "string"
  );
}

function normalizeKvEvent(raw: unknown): StoredEvent | null {
  if (!isStoredEvent(raw)) return null;
  return {
    ...raw,
    day: raw.day || localDay(raw.ts),
    demo: raw.demo ?? raw.visitorId.startsWith("demo-"),
  };
}

/* ============================================================
   Inserção
   ============================================================ */

export async function insertEvents(events: StoredEvent[]): Promise<StoreMode> {
  if (events.length === 0) return getStoreMode();

  let mode = await getStoreMode();

  if (mode === "table") {
    // Colunas opcionais podem não existir em instalações com schema antigo.
    // Em vez de perder o lote, tenta novamente sem a coluna problemática.
    const optionalColumns = ["placement", "depth"];
    let rows: Array<Record<string, unknown>> = events.map((event) => ({
      ...toTableRow(event),
    }));
    let { error } = await supabaseAdmin.from(TABLE).insert(rows);

    for (let attempt = 0; attempt < optionalColumns.length; attempt += 1) {
      if (!error) break;
      const missing = optionalColumns.find((column) =>
        isMissingColumnError(error, column)
      );
      if (!missing) break;
      rows = rows.map((row) => {
        const next: Record<string, unknown> = { ...row };
        delete next[missing];
        return next;
      });
      const retry = await supabaseAdmin.from(TABLE).insert(rows);
      error = retry.error;
    }

    if (!error) return "table";

    if (isMissingTableError(error)) {
      forceKvMode();
      mode = "kv";
    } else {
      throw new Error(`Não foi possível gravar os eventos: ${error.message}`);
    }
  }

  if (mode === "kv") {
    const rows = events.map((event) => ({
      key: kvKey(event),
      value: JSON.stringify(event),
    }));

    const { error } = await supabaseAdmin
      .from(KV_TABLE)
      .upsert(rows, { onConflict: "key", ignoreDuplicates: true });

    if (error) {
      throw new Error(`Não foi possível gravar os eventos: ${error.message}`);
    }
    return mode;
  }

  await withFileLock(async () => {
    const all = await readFileEvents();
    all.push(...events);
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(all), "utf8");
  });

  return mode;
}

/* ============================================================
   Leitura
   ============================================================ */

export async function fetchEvents(query: EventQuery): Promise<{
  events: StoredEvent[];
  mode: StoreMode;
  truncated: boolean;
}> {
  const mode = await getStoreMode();

  if (mode === "table") {
    try {
      return await fetchFromTable(query);
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      forceKvMode();
      return fetchFromKv(query);
    }
  }

  if (mode === "kv") {
    return fetchFromKv(query);
  }

  return fetchFromFile(query);
}

async function fetchFromTable(query: EventQuery) {
  try {
    return await fetchFromTableRows(query, true);
  } catch (error) {
    // Schema antigo sem a coluna `depth`: relê sem ela.
    if (isMissingColumnError(error, "depth")) {
      return fetchFromTableRows(query, false);
    }
    throw error;
  }
}

async function fetchFromTableRows(query: EventQuery, includeDepth: boolean) {
  const events: StoredEvent[] = [];
  let offset = 0;
  let truncated = false;
  const columns = [
    "event_type",
    "visitor_id",
    "session_id",
    "page",
    "program_id",
    "program_name",
    "form_id",
    "placement",
    ...(includeDepth ? ["depth"] : []),
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "referrer",
    "device",
    "event_ts",
  ].join(",");

  while (true) {
    let builder = supabaseAdmin
      .from(TABLE)
      .select(columns)
      .gte("event_ts", query.fromISO)
      .lt("event_ts", query.toISO)
      .order("event_ts", { ascending: true });

    builder = query.onlyDemo
      ? builder.like("visitor_id", "demo-%")
      : builder.not("visitor_id", "like", "demo-%");

    const { data, error } = await builder.range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Não foi possível ler os eventos: ${error.message}`);
    }

    for (const row of data ?? []) {
      events.push(fromTableRow(row as unknown as Record<string, unknown>));
    }

    if ((data?.length ?? 0) < PAGE_SIZE) break;

    offset += PAGE_SIZE;
    if (events.length >= MAX_EVENTS) {
      truncated = true;
      break;
    }
  }

  return { events, mode: "table" as StoreMode, truncated };
}

async function fetchFromKv(query: EventQuery) {
  const prefix = query.onlyDemo ? `${KV_PREFIX}demo:` : KV_PREFIX;
  const lower = `${prefix}${query.fromDay}`;
  const upper = `${prefix}${query.toDayExclusive}`;

  const events: StoredEvent[] = [];
  let offset = 0;
  let truncated = false;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from(KV_TABLE)
      .select("key,value")
      .gte("key", lower)
      .lt("key", upper)
      .order("key", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Não foi possível ler os eventos: ${error.message}`);
    }

    for (const row of data ?? []) {
      try {
        const parsed = normalizeKvEvent(JSON.parse(row.value ?? "null"));
        if (parsed) events.push(parsed);
      } catch {
        // Linha inválida: ignora em vez de derrubar o painel.
      }
    }

    if ((data?.length ?? 0) < PAGE_SIZE) break;

    offset += PAGE_SIZE;
    if (events.length >= MAX_EVENTS) {
      truncated = true;
      break;
    }
  }

  return { events, mode: "kv" as StoreMode, truncated };
}

async function fetchFromFile(query: EventQuery) {
  const all = await readFileEvents();
  const from = new Date(query.fromISO).getTime();
  const to = new Date(query.toISO).getTime();

  const events = all.filter((event) => {
    const ts = new Date(event.ts).getTime();
    if (!Number.isFinite(ts) || ts < from || ts >= to) return false;
    const isDemo = event.demo ?? event.visitorId.startsWith("demo-");
    return query.onlyDemo ? isDemo : !isDemo;
  });

  return {
    events: events.sort((a, b) => a.ts.localeCompare(b.ts)),
    mode: "file" as StoreMode,
    truncated: false,
  };
}

/* ============================================================
   Demonstração
   ============================================================ */

export async function hasDemoEvents(): Promise<boolean> {
  const mode = await getStoreMode();

  if (mode === "table") {
    const { count, error } = await supabaseAdmin
      .from(TABLE)
      .select("id", { head: true, count: "exact" })
      .like("visitor_id", "demo-%");

    if (error) return false;
    return (count ?? 0) > 0;
  }

  if (mode === "kv") {
    const { data, error } = await supabaseAdmin
      .from(KV_TABLE)
      .select("key")
      .like("key", `${KV_PREFIX}demo:%`)
      .limit(1);

    if (error) return false;
    return (data?.length ?? 0) > 0;
  }

  const all = await readFileEvents();
  return all.some((event) => event.visitorId.startsWith("demo-"));
}

export async function deleteDemoEvents(): Promise<number> {
  const mode = await getStoreMode();

  if (mode === "table") {
    const { count, error } = await supabaseAdmin
      .from(TABLE)
      .delete({ count: "exact" })
      .like("visitor_id", "demo-%");

    if (error) {
      throw new Error(`Não foi possível remover a demonstração: ${error.message}`);
    }
    return count ?? 0;
  }

  if (mode === "kv") {
    // Filtro por prefixo no próprio DELETE: evita URLs gigantes com .in(keys)
    // e funciona mesmo com muitos eventos de demonstração.
    const { count, error } = await supabaseAdmin
      .from(KV_TABLE)
      .delete({ count: "exact" })
      .like("key", `${KV_PREFIX}demo:%`);

    if (error) {
      throw new Error(
        `Não foi possível remover a demonstração: ${error.message}`
      );
    }

    return count ?? 0;
  }

  return withFileLock(async () => {
    const all = await readFileEvents();
    const keep = all.filter((event) => !event.visitorId.startsWith("demo-"));
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(keep), "utf8");
    return all.length - keep.length;
  });
}

/* ============================================================
   Retenção — remove eventos antigos (padrão: 1 ano)
   ============================================================ */

export async function cleanupOldEvents(retainDays = 365): Promise<{
  mode: StoreMode;
  deleted: number;
}> {
  const safeDays = Math.max(30, Math.floor(retainDays));
  const cutoffDay = addDays(todayLocal(), -safeDays);
  const cutoffISO = dayStartISO(cutoffDay);
  const mode = await getStoreMode();

  if (mode === "table") {
    const { count, error } = await supabaseAdmin
      .from(TABLE)
      .delete({ count: "exact" })
      .lt("event_ts", cutoffISO);

    if (error) {
      throw new Error(`Não foi possível limpar eventos antigos: ${error.message}`);
    }

    return { mode, deleted: count ?? 0 };
  }

  if (mode === "kv") {
    const demoPrefix = `${KV_PREFIX}demo:`;
    const ranges: Array<[string, string]> = [
      [KV_PREFIX, `${KV_PREFIX}${cutoffDay}`],
      [demoPrefix, `${demoPrefix}${cutoffDay}`],
    ];

    let deleted = 0;

    for (const [prefix, bound] of ranges) {
      const { count, error } = await supabaseAdmin
        .from(KV_TABLE)
        .delete({ count: "exact" })
        .gte("key", prefix)
        .lt("key", bound);

      if (error) {
        throw new Error(
          `Não foi possível limpar eventos antigos: ${error.message}`
        );
      }

      deleted += count ?? 0;
    }

    return { mode, deleted };
  }

  return withFileLock(async () => {
    const all = await readFileEvents();
    const cutoff = new Date(cutoffISO).getTime();
    const keep = all.filter((event) => {
      const ts = new Date(event.ts).getTime();
      return Number.isFinite(ts) && ts >= cutoff;
    });

    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(keep), "utf8");

    return { mode, deleted: all.length - keep.length };
  });
}

/* ============================================================
   Arquivo local (desenvolvimento)
   ============================================================ */

async function readFileEvents(): Promise<StoredEvent[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeKvEvent(item))
      .filter((item): item is StoredEvent => Boolean(item));
  } catch {
    return [];
  }
}

function withFileLock<T>(operation: () => Promise<T>): Promise<T> {
  const next = fileLock.then(operation, operation);
  fileLock = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}
