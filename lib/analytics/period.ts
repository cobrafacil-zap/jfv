import {
  addDays,
  daysBetween,
  isValidDay,
  previousPeriod,
  todayLocal,
} from "./time";

export type ParsedPeriod = {
  from: string;
  to: string;
  days: string[];
  length: number;
  previous: { from: string; to: string; days: string[] };
};

export class PeriodError extends Error {}

export function parsePeriod(searchParams: URLSearchParams): ParsedPeriod {
  const today = todayLocal();
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");

  const from = isValidDay(rawFrom) ? rawFrom : addDays(today, -6);
  const to = isValidDay(rawTo) ? rawTo : today;

  if (from > to) {
    throw new PeriodError("A data inicial não pode ser posterior à data final.");
  }

  const days = daysBetween(from, to);
  if (days.length === 0 || days.length > 366) {
    throw new PeriodError("Escolha um período de até 366 dias.");
  }

  const previous = previousPeriod(from, to);

  return {
    from,
    to,
    days,
    length: days.length,
    previous: {
      ...previous,
      days: daysBetween(previous.from, previous.to),
    },
  };
}
