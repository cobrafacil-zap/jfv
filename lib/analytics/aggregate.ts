import { formatDayLabel, localDay } from "./time";
import { KNOWN_PROGRAMS } from "./programs";
import type { StoredEvent } from "./types";

export type SourceName =
  | "Instagram"
  | "Google"
  | "Direto"
  | "E-mail"
  | "WhatsApp"
  | "Outras";

export const SOURCE_ORDER: SourceName[] = [
  "Instagram",
  "Google",
  "Direto",
  "E-mail",
  "WhatsApp",
  "Outras",
];

export type DailyPoint = {
  date: string;
  label: string;
  visitors: number;
  pageviews: number;
  conversions: number;
  whatsappClicks: number;
  whatsappVisitors: number;
  programClicks: number;
  conversionRate: number;
};

export type SourceRow = {
  name: SourceName;
  visitors: number;
  share: number;
};

export type ProgramRow = {
  id: string;
  name: string;
  clicks: number;
  visitors: number;
  share: number;
  change: number | null;
};

export type Metrics = {
  hasData: boolean;
  eventCount: number;
  totals: {
    visitors: number;
    pageviews: number;
    whatsappClicks: number;
    whatsappVisitors: number;
    programClicks: number;
    programVisitors: number;
    formSubmits: number;
    formVisitors: number;
    conversionRate: number;
  };
  changes: {
    visitors: number | null;
    whatsappVisitors: number | null;
    programClicks: number | null;
    conversionRate: number | null;
  };
  daily: DailyPoint[];
  sources: SourceRow[];
  programs: ProgramRow[];
  sparklines: {
    visitors: number[];
    whatsapp: number[];
    programClicks: number[];
    conversionRate: number[];
  };
};

type DailyBucket = {
  visitors: Set<string>;
  pageviews: number;
  conversions: number;
  whatsappClicks: number;
  whatsappVisitors: Set<string>;
  programClicks: number;
};

type ProgramBucket = {
  id: string;
  name: string;
  clicks: number;
  visitors: Set<string>;
};

type Aggregate = {
  visitors: Set<string>;
  pageviews: number;
  whatsappClicks: number;
  whatsappVisitors: Set<string>;
  programClicks: number;
  programVisitors: Set<string>;
  formSubmits: number;
  formVisitors: Set<string>;
  eventCount: number;
  daily: Map<string, DailyBucket>;
  programs: Map<string, ProgramBucket>;
  sources: Map<SourceName, Set<string>>;
};

function emptyDaily(): DailyBucket {
  return {
    visitors: new Set(),
    pageviews: 0,
    conversions: 0,
    whatsappClicks: 0,
    whatsappVisitors: new Set(),
    programClicks: 0,
  };
}

function emptyAggregate(days: string[]): Aggregate {
  const daily = new Map<string, DailyBucket>();
  for (const day of days) daily.set(day, emptyDaily());
  return {
    visitors: new Set(),
    pageviews: 0,
    whatsappClicks: 0,
    whatsappVisitors: new Set(),
    programClicks: 0,
    programVisitors: new Set(),
    formSubmits: 0,
    formVisitors: new Set(),
    eventCount: 0,
    daily,
    programs: new Map(),
    sources: new Map(),
  };
}

function classifySource(event: StoredEvent): SourceName {
  const utm = (event.utmSource || "").toLowerCase().trim();

  if (utm) {
    if (/instagram|insta|^ig$/.test(utm)) return "Instagram";
    if (/google|adwords|gads|googleads/.test(utm)) return "Google";
    if (/email|e-mail|newsletter|mail/.test(utm)) return "E-mail";
    if (/whatsapp|whats|^wa$/.test(utm)) return "WhatsApp";
    return "Outras";
  }

  const referrer = (event.referrer || "").toLowerCase();
  if (referrer) {
    if (referrer.includes("instagram.")) return "Instagram";
    if (referrer.includes("google.")) return "Google";
    if (
      referrer.includes("mail.google.") ||
      referrer.includes("outlook.") ||
      referrer.includes("yahoo.") ||
      referrer.includes("proton.")
    ) {
      return "E-mail";
    }
    if (referrer.includes("wa.me") || referrer.includes("whatsapp.")) {
      return "WhatsApp";
    }
    return "Outras";
  }

  return "Direto";
}

function aggregateEvents(events: StoredEvent[], days: string[]): Aggregate {
  const aggregate = emptyAggregate(days);
  const daySet = new Set(days);
  const visitorSource = new Map<string, SourceName>();

  // Ordena por horário: a primeira origem relevante de cada visitante vence.
  const ordered = [...events].sort((a, b) => a.ts.localeCompare(b.ts));

  for (const event of ordered) {
    const day = event.day || localDay(event.ts);
    if (!daySet.has(day)) continue;

    const bucket = aggregate.daily.get(day) ?? emptyDaily();
    aggregate.daily.set(day, bucket);
    aggregate.eventCount += 1;

    if (event.type === "pageview") {
      aggregate.visitors.add(event.visitorId);
      aggregate.pageviews += 1;
      bucket.visitors.add(event.visitorId);
      bucket.pageviews += 1;

      const source = classifySource(event);
      const current = visitorSource.get(event.visitorId);
      if (!current || (current === "Direto" && source !== "Direto")) {
        visitorSource.set(event.visitorId, source);
      }
    } else if (event.type === "click_whatsapp") {
      aggregate.whatsappClicks += 1;
      aggregate.whatsappVisitors.add(event.visitorId);
      bucket.whatsappClicks += 1;
      bucket.whatsappVisitors.add(event.visitorId);
    } else if (event.type === "click_programa") {
      aggregate.programClicks += 1;
      aggregate.programVisitors.add(event.visitorId);
      bucket.programClicks += 1;

      const id = event.programId || "desconhecido";
      const name = event.programName || id;
      const program = aggregate.programs.get(id) ?? {
        id,
        name,
        clicks: 0,
        visitors: new Set<string>(),
      };
      program.clicks += 1;
      program.visitors.add(event.visitorId);
      // Mantém o nome mais recente enviado pelo site.
      if (event.programName) program.name = event.programName;
      aggregate.programs.set(id, program);
    } else if (event.type === "form_submit") {
      aggregate.formSubmits += 1;
      aggregate.formVisitors.add(event.visitorId);
      bucket.conversions += 1;
    }
  }

  for (const [visitorId, source] of visitorSource) {
    const set = aggregate.sources.get(source) ?? new Set<string>();
    set.add(visitorId);
    aggregate.sources.set(source, set);
  }

  return aggregate;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function computeMetrics(
  currentEvents: StoredEvent[],
  previousEvents: StoredEvent[],
  days: string[],
  previousDays: string[]
): Metrics {
  const current = aggregateEvents(currentEvents, days);
  const previous = aggregateEvents(previousEvents, previousDays);

  const currentRate = rate(current.formSubmits, current.visitors.size);
  const previousRate = rate(previous.formSubmits, previous.visitors.size);

  const totalProgramClicks = current.programClicks;
  const totalSourceVisitors = current.visitors.size;

  const sources: SourceRow[] = SOURCE_ORDER.map((name) => {
    const visitors = current.sources.get(name)?.size ?? 0;
    return {
      name,
      visitors,
      share: totalSourceVisitors > 0 ? round((visitors / totalSourceVisitors) * 100) : 0,
    };
  }).sort((a, b) => {
    if (b.visitors !== a.visitors) return b.visitors - a.visitors;
    return SOURCE_ORDER.indexOf(a.name) - SOURCE_ORDER.indexOf(b.name);
  });

  const knownPrograms = new Map(KNOWN_PROGRAMS.map((program) => [program.id, program.name]));
  const allProgramIds = new Set<string>([
    ...knownPrograms.keys(),
    ...current.programs.keys(),
    ...previous.programs.keys(),
  ]);

  const programs: ProgramRow[] = Array.from(allProgramIds)
    .map((id) => {
      const found = current.programs.get(id);
      const previousFound = previous.programs.get(id);
      const name =
        found?.name ?? previousFound?.name ?? knownPrograms.get(id) ?? id;
      const clicks = found?.clicks ?? 0;
      const visitors = found?.visitors.size ?? 0;
      return {
        id,
        name,
        clicks,
        visitors,
        share: totalProgramClicks > 0 ? round((clicks / totalProgramClicks) * 100) : 0,
        change: percentChange(clicks, previousFound?.clicks ?? 0),
      };
    })
    .sort((a, b) => {
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      return a.name.localeCompare(b.name, "pt-BR");
    });

  const daily: DailyPoint[] = days.map((day) => {
    const bucket = current.daily.get(day) ?? emptyDaily();
    return {
      date: day,
      label: formatDayLabel(day),
      visitors: bucket.visitors.size,
      pageviews: bucket.pageviews,
      conversions: bucket.conversions,
      whatsappClicks: bucket.whatsappClicks,
      whatsappVisitors: bucket.whatsappVisitors.size,
      programClicks: bucket.programClicks,
      conversionRate: round(rate(bucket.conversions, bucket.visitors.size)),
    };
  });

  return {
    hasData:
      current.pageviews > 0 ||
      current.whatsappClicks > 0 ||
      current.programClicks > 0 ||
      current.formSubmits > 0,
    eventCount: current.eventCount,
    totals: {
      visitors: current.visitors.size,
      pageviews: current.pageviews,
      whatsappClicks: current.whatsappClicks,
      whatsappVisitors: current.whatsappVisitors.size,
      programClicks: current.programClicks,
      programVisitors: current.programVisitors.size,
      formSubmits: current.formSubmits,
      formVisitors: current.formVisitors.size,
      conversionRate: round(currentRate),
    },
    changes: {
      visitors: percentChange(current.visitors.size, previous.visitors.size),
      whatsappVisitors: percentChange(
        current.whatsappVisitors.size,
        previous.whatsappVisitors.size
      ),
      programClicks: percentChange(current.programClicks, previous.programClicks),
      conversionRate: percentChange(currentRate, previousRate),
    },
    daily,
    sources,
    programs,
    sparklines: {
      visitors: daily.map((point) => point.visitors),
      whatsapp: daily.map((point) => point.whatsappVisitors),
      programClicks: daily.map((point) => point.programClicks),
      conversionRate: daily.map((point) => point.conversionRate),
    },
  };
}
