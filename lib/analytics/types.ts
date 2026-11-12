export type AnalyticsEventType =
  | "pageview"
  | "click_programa"
  | "click_whatsapp"
  | "form_submit"
  | "scroll_depth";

export type DeviceType = "mobile" | "desktop";

/** Evento normalizado, independente de onde ele foi gravado. */
export type StoredEvent = {
  type: AnalyticsEventType;
  visitorId: string;
  sessionId?: string;
  page?: string;
  programId?: string;
  programName?: string;
  formId?: string;
  placement?: string;
  /** Profundidade de leitura da página (25, 50, 75, 90 ou 100). */
  depth?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  device?: DeviceType;
  /** ISO 8601 */
  ts: string;
  /** Dia local (America/Sao_Paulo) no formato YYYY-MM-DD */
  day: string;
  /** Eventos sintéticos do modo demonstração */
  demo?: boolean;
};

export type StoreMode = "table" | "kv" | "file";

export type EventQuery = {
  /** Início do período em ISO (inclusivo) */
  fromISO: string;
  /** Fim do período em ISO (exclusivo) */
  toISO: string;
  /** Primeiro dia local (YYYY-MM-DD) */
  fromDay: string;
  /** Dia local seguinte ao último dia (YYYY-MM-DD) */
  toDayExclusive: string;
  /** Quando true, busca apenas os eventos de demonstração */
  onlyDemo?: boolean;
};
