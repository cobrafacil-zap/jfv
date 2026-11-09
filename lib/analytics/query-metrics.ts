import { computeMetrics } from "./aggregate";
import { parsePeriod } from "./period";
import { fetchEvents, hasDemoEvents } from "./store";
import { addDays, dayStartISO } from "./time";

export async function loadMetrics(options: {
  searchParams: URLSearchParams;
  onlyDemo: boolean;
}) {
  const period = parsePeriod(options.searchParams);

  const current = await fetchEvents({
    fromISO: dayStartISO(period.from),
    toISO: dayStartISO(addDays(period.to, 1)),
    fromDay: period.from,
    toDayExclusive: addDays(period.to, 1),
    onlyDemo: options.onlyDemo,
  });

  const previous = await fetchEvents({
    fromISO: dayStartISO(period.previous.from),
    toISO: dayStartISO(addDays(period.previous.to, 1)),
    fromDay: period.previous.from,
    toDayExclusive: addDays(period.previous.to, 1),
    onlyDemo: options.onlyDemo,
  });

  const metrics = computeMetrics(
    current.events,
    previous.events,
    period.days,
    period.previous.days
  );

  const demoAvailable = options.onlyDemo ? true : await hasDemoEvents();

  return {
    ...metrics,
    period: { from: period.from, to: period.to, days: period.length },
    previousPeriod: period.previous,
    mode: options.onlyDemo ? ("demo" as const) : ("real" as const),
    demoAvailable,
    storage: current.mode,
    truncated: current.truncated || previous.truncated,
    updatedAt: new Date().toISOString(),
  };
}
