import { ANALYTICS_TIMEZONE, formatDayLabel, localDay } from "./time";
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

export type FunnelStage = {
  key: "visitors" | "program" | "whatsapp" | "form";
  label: string;
  value: number;
  /** % em relação à primeira etapa */
  fromStart: number;
  /** % em relação à etapa anterior */
  fromPrevious: number;
};

export type CampaignRow = {
  key: string;
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  programClicks: number;
  formSubmits: number;
  conversionRate: number;
  share: number;
};

export type DeviceName = "mobile" | "desktop" | "desconhecido";

export type DeviceRow = {
  name: DeviceName;
  label: string;
  visitors: number;
  pageviews: number;
  formSubmits: number;
  conversionRate: number;
  share: number;
};

export type PlacementRow = {
  id: string;
  name: string;
  clicks: number;
  visitors: number;
  share: number;
};

export type PageRow = {
  page: string;
  label: string;
  pageviews: number;
  visitors: number;
  formSubmits: number;
  conversionRate: number;
  share: number;
};

export type Heatmap = {
  weekdays: string[];
  buckets: string[];
  /** cells[diaDaSemana][faixaDeHorario] = visitas */
  cells: number[][];
  max: number;
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
    pageviews: number | null;
    whatsappClicks: number | null;
    whatsappVisitors: number | null;
    programClicks: number | null;
    conversionRate: number | null;
  };
  daily: DailyPoint[];
  sources: SourceRow[];
  programs: ProgramRow[];
  funnel: FunnelStage[];
  campaigns: CampaignRow[];
  devices: DeviceRow[];
  placements: PlacementRow[];
  pages: PageRow[];
  heatmap: Heatmap;
  sparklines: {
    visitors: number[];
    pageviews: number[];
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

type CampaignBucket = {
  source: string;
  medium: string;
  campaign: string;
  visitors: Set<string>;
  programClicks: number;
  formSubmits: number;
};

type DeviceBucket = {
  visitors: Set<string>;
  pageviews: number;
  formSubmits: number;
  formVisitors: Set<string>;
};

type PlacementBucket = {
  clicks: number;
  visitors: Set<string>;
};

type PageBucket = {
  pageviews: number;
  visitors: Set<string>;
  formSubmits: number;
  formVisitors: Set<string>;
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
  campaigns: Map<string, CampaignBucket>;
  devices: Map<DeviceName, DeviceBucket>;
  placements: Map<string, PlacementBucket>;
  pages: Map<string, PageBucket>;
  heatmap: number[][];
};

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HEAT_BUCKETS = [
  "0–2h",
  "3–5h",
  "6–8h",
  "9–11h",
  "12–14h",
  "15–17h",
  "18–20h",
  "21–23h",
];

const DEVICE_ORDER: DeviceName[] = ["mobile", "desktop", "desconhecido"];
const DEVICE_LABELS: Record<DeviceName, string> = {
  mobile: "Celular",
  desktop: "Computador",
  desconhecido: "Não identificado",
};

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ANALYTICS_TIMEZONE,
  hour: "2-digit",
  hourCycle: "h23",
});

function localHour(ts: string): number {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return 0;
  const hour = Number(hourFormatter.format(date));
  if (!Number.isFinite(hour)) return 0;
  return Math.min(23, Math.max(0, hour));
}

function weekdayOf(day: string): number {
  const [year, month, date] = day.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, date, 12)).getUTCDay();
  return Number.isFinite(value) ? value : 0;
}

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

function emptyDevice(): DeviceBucket {
  return {
    visitors: new Set(),
    pageviews: 0,
    formSubmits: 0,
    formVisitors: new Set(),
  };
}

function emptyAggregate(days: string[]): Aggregate {
  const daily = new Map<string, DailyBucket>();
  for (const day of days) daily.set(day, emptyDaily());

  const devices = new Map<DeviceName, DeviceBucket>();
  for (const name of DEVICE_ORDER) devices.set(name, emptyDevice());

  const heatmap = Array.from({ length: 7 }, () =>
    Array.from({ length: HEAT_BUCKETS.length }, () => 0)
  );

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
    campaigns: new Map(),
    devices,
    placements: new Map(),
    pages: new Map(),
    heatmap,
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

function campaignOf(event: StoredEvent): {
  key: string;
  source: string;
  medium: string;
  campaign: string;
} {
  const source = (event.utmSource || "").trim();
  const medium = (event.utmMedium || "").trim();
  const campaign = (event.utmCampaign || "").trim();

  if (!source && !medium && !campaign) {
    const auto = classifySource(event);
    return {
      key: `auto:${auto}`,
      source: auto,
      medium: "—",
      campaign: "Sem campanha",
    };
  }

  const sourceLabel = source || "(sem origem)";
  const mediumLabel = medium || "(sem mídia)";
  const campaignLabel = campaign || "(sem campanha)";

  return {
    key: `${sourceLabel}|${mediumLabel}|${campaignLabel}`,
    source: sourceLabel,
    medium: mediumLabel,
    campaign: campaignLabel,
  };
}

function placementLabel(id: string): string {
  if (id.startsWith("programa-")) {
    const programId = id.slice("programa-".length);
    const known = KNOWN_PROGRAMS.find((program) => program.id === programId);
    return known ? `Card · ${known.name}` : "Card do programa";
  }

  switch (id) {
    case "programas-equipe":
      return "Seção de programas";
    case "hero":
      return "Topo da página";
    case "footer":
      return "Rodapé";
    case "popup-saida":
      return "Popup de saída";
    case "flutuante":
      return "Botão flutuante";
    default:
      return "Outros links";
  }
}

function pageLabel(page: string): string {
  if (page === "/" || page === "") return "Página inicial";
  if (page === "/aceleracao") return "Aceleração Comercial";
  if (page === "/aplicacao") return "Aplicação · Do Zero aos 10k";
  return page;
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

      const campaignInfo = campaignOf(event);
      const campaign = aggregate.campaigns.get(campaignInfo.key) ?? {
        source: campaignInfo.source,
        medium: campaignInfo.medium,
        campaign: campaignInfo.campaign,
        visitors: new Set<string>(),
        programClicks: 0,
        formSubmits: 0,
      };
      campaign.visitors.add(event.visitorId);
      aggregate.campaigns.set(campaignInfo.key, campaign);

      const deviceName: DeviceName = event.device ?? "desconhecido";
      const device = aggregate.devices.get(deviceName) ?? emptyDevice();
      device.visitors.add(event.visitorId);
      device.pageviews += 1;
      aggregate.devices.set(deviceName, device);

      const page = event.page || "/";
      const pageBucket = aggregate.pages.get(page) ?? {
        pageviews: 0,
        visitors: new Set<string>(),
        formSubmits: 0,
        formVisitors: new Set<string>(),
      };
      pageBucket.pageviews += 1;
      pageBucket.visitors.add(event.visitorId);
      aggregate.pages.set(page, pageBucket);

      const weekday = weekdayOf(day);
      const hourBucket = Math.min(
        HEAT_BUCKETS.length - 1,
        Math.floor(localHour(event.ts) / 3)
      );
      aggregate.heatmap[weekday][hourBucket] += 1;
    } else if (event.type === "click_whatsapp") {
      aggregate.whatsappClicks += 1;
      aggregate.whatsappVisitors.add(event.visitorId);
      bucket.whatsappClicks += 1;
      bucket.whatsappVisitors.add(event.visitorId);

      const placement = event.placement || "link";
      const row = aggregate.placements.get(placement) ?? {
        clicks: 0,
        visitors: new Set<string>(),
      };
      row.clicks += 1;
      row.visitors.add(event.visitorId);
      aggregate.placements.set(placement, row);
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

      const campaignInfo = campaignOf(event);
      const campaign = aggregate.campaigns.get(campaignInfo.key);
      if (campaign) campaign.programClicks += 1;
    } else if (event.type === "form_submit") {
      aggregate.formSubmits += 1;
      aggregate.formVisitors.add(event.visitorId);
      bucket.conversions += 1;

      const campaignInfo = campaignOf(event);
      const campaign = aggregate.campaigns.get(campaignInfo.key);
      if (campaign) campaign.formSubmits += 1;

      const deviceName: DeviceName = event.device ?? "desconhecido";
      const device = aggregate.devices.get(deviceName) ?? emptyDevice();
      device.formSubmits += 1;
      device.formVisitors.add(event.visitorId);
      aggregate.devices.set(deviceName, device);

      const page = event.page || "/";
      const pageBucket = aggregate.pages.get(page) ?? {
        pageviews: 0,
        visitors: new Set<string>(),
        formSubmits: 0,
        formVisitors: new Set<string>(),
      };
      pageBucket.formSubmits += 1;
      pageBucket.formVisitors.add(event.visitorId);
      aggregate.pages.set(page, pageBucket);
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

  const funnelValues: Array<{
    key: FunnelStage["key"];
    label: string;
    value: number;
  }> = [
    { key: "visitors", label: "Visitaram a página", value: current.visitors.size },
    {
      key: "program",
      label: "Clicaram em um programa",
      value: current.programVisitors.size,
    },
    {
      key: "whatsapp",
      label: "Chamaram no WhatsApp",
      value: current.whatsappVisitors.size,
    },
    {
      key: "form",
      label: "Preencheram o formulário",
      value: current.formVisitors.size,
    },
  ];

  const funnel: FunnelStage[] = funnelValues.map((stage, index) => {
    const previousValue = index === 0 ? stage.value : funnelValues[index - 1].value;
    return {
      ...stage,
      fromStart: round(rate(stage.value, funnelValues[0].value)),
      fromPrevious:
        index === 0
          ? 100
          : previousValue > 0
          ? round(rate(stage.value, previousValue))
          : stage.value > 0
          ? 100
          : 0,
    };
  });

  const totalCampaignVisitors = Array.from(current.campaigns.values()).reduce(
    (sum, row) => sum + row.visitors.size,
    0
  );

  const campaigns: CampaignRow[] = Array.from(current.campaigns.entries())
    .map(([key, row]) => ({
      key,
      source: row.source,
      medium: row.medium,
      campaign: row.campaign,
      visitors: row.visitors.size,
      programClicks: row.programClicks,
      formSubmits: row.formSubmits,
      conversionRate: round(rate(row.formSubmits, row.visitors.size)),
      share:
        totalCampaignVisitors > 0
          ? round((row.visitors.size / totalCampaignVisitors) * 100)
          : 0,
    }))
    .filter((row) => row.visitors > 0 || row.programClicks > 0 || row.formSubmits > 0)
    .sort((a, b) => {
      if (b.visitors !== a.visitors) return b.visitors - a.visitors;
      if (b.formSubmits !== a.formSubmits) return b.formSubmits - a.formSubmits;
      return a.source.localeCompare(b.source, "pt-BR");
    });

  const totalDeviceVisitors = Array.from(current.devices.values()).reduce(
    (sum, row) => sum + row.visitors.size,
    0
  );

  const devices: DeviceRow[] = DEVICE_ORDER.map((name) => {
    const row = current.devices.get(name) ?? emptyDevice();
    return {
      name,
      label: DEVICE_LABELS[name],
      visitors: row.visitors.size,
      pageviews: row.pageviews,
      formSubmits: row.formSubmits,
      conversionRate: round(rate(row.formSubmits, row.visitors.size)),
      share:
        totalDeviceVisitors > 0
          ? round((row.visitors.size / totalDeviceVisitors) * 100)
          : 0,
    };
  }).filter((row) => row.visitors > 0 || row.formSubmits > 0);

  const placements: PlacementRow[] = Array.from(current.placements.entries())
    .map(([id, row]) => ({
      id,
      name: placementLabel(id),
      clicks: row.clicks,
      visitors: row.visitors.size,
      share:
        current.whatsappClicks > 0
          ? round((row.clicks / current.whatsappClicks) * 100)
          : 0,
    }))
    .filter((row) => row.clicks > 0)
    .sort((a, b) => {
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      return a.name.localeCompare(b.name, "pt-BR");
    });

  const pages: PageRow[] = Array.from(current.pages.entries())
    .map(([page, row]) => ({
      page,
      label: pageLabel(page),
      pageviews: row.pageviews,
      visitors: row.visitors.size,
      formSubmits: row.formSubmits,
      conversionRate: round(rate(row.formSubmits, row.visitors.size)),
      share:
        current.pageviews > 0 ? round((row.pageviews / current.pageviews) * 100) : 0,
    }))
    .filter((row) => row.pageviews > 0 || row.formSubmits > 0)
    .sort((a, b) => {
      if (b.pageviews !== a.pageviews) return b.pageviews - a.pageviews;
      return a.label.localeCompare(b.label, "pt-BR");
    });

  const heatmap: Heatmap = {
    weekdays: WEEKDAY_SHORT,
    buckets: HEAT_BUCKETS,
    cells: current.heatmap,
    max: Math.max(0, ...current.heatmap.flat()),
  };

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
      pageviews: percentChange(current.pageviews, previous.pageviews),
      whatsappClicks: percentChange(
        current.whatsappClicks,
        previous.whatsappClicks
      ),
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
    funnel,
    campaigns,
    devices,
    placements,
    pages,
    heatmap,
    sparklines: {
      visitors: daily.map((point) => point.visitors),
      pageviews: daily.map((point) => point.pageviews),
      whatsapp: daily.map((point) => point.whatsappClicks),
      programClicks: daily.map((point) => point.programClicks),
      conversionRate: daily.map((point) => point.conversionRate),
    },
  };
}
