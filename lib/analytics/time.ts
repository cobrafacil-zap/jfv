/**
 * Datas do painel são agrupadas no fuso de São Paulo.
 * O Brasil não tem horário de verão desde 2019, então o offset -03:00
 * é estável para todas as datas usadas pelo painel.
 */
export const ANALYTICS_TIMEZONE = "America/Sao_Paulo";
const SAO_PAULO_OFFSET = "-03:00";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ANALYTICS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function localDay(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return localDay(new Date());

  const parts = dayFormatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function todayLocal(): string {
  return localDay(new Date());
}

export function isValidDay(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function dayStartISO(day: string): string {
  return new Date(`${day}T00:00:00${SAO_PAULO_OFFSET}`).toISOString();
}

export function addDays(day: string, delta: number): string {
  const date = new Date(`${day}T12:00:00${SAO_PAULO_OFFSET}`);
  date.setUTCDate(date.getUTCDate() + delta);
  return localDay(date);
}

export function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  let cursor = from;
  // Proteção contra intervalos absurdos.
  while (cursor <= to && days.length < 400) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function periodLength(from: string, to: string): number {
  return daysBetween(from, to).length;
}

export function previousPeriod(from: string, to: string) {
  const length = periodLength(from, to);
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -(length - 1));
  return { from: previousFrom, to: previousTo };
}

export function formatDayLabel(day: string): string {
  const [, month, date] = day.split("-");
  return `${date}/${month}`;
}

export function formatDayLong(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: ANALYTICS_TIMEZONE,
  }).format(new Date(Date.UTC(year, month - 1, date, 12)));
}
