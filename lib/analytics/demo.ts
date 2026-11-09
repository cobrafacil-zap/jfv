import type { StoredEvent } from "./types";

/* ============================================================
   Dados de demonstração — usados apenas no modo demo do painel.
   Nenhum dado pessoal: IDs, páginas e origens são fictícios.
   ============================================================ */

const PROGRAMS = [
  { id: "jfv-assinatura", name: "Jeito Fácil de Vender", weight: 0.4 },
  { id: "zero-10k", name: "Do Zero aos 10k", weight: 0.35 },
  { id: "empresas-aceleracao", name: "Aceleração Comercial", weight: 0.25 },
];

const SOURCES = [
  {
    name: "Instagram",
    weight: 0.4,
    utmSource: "instagram",
    utmMedium: "social",
    utmCampaign: "metodo-jfv",
    referrer: "https://www.instagram.com/",
  },
  {
    name: "Google",
    weight: 0.18,
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "vendas-b2b",
    referrer: "https://www.google.com/",
  },
  {
    name: "Direto",
    weight: 0.2,
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    referrer: "",
  },
  {
    name: "WhatsApp",
    weight: 0.1,
    utmSource: "whatsapp",
    utmMedium: "referral",
    utmCampaign: "grupo-vendas",
    referrer: "https://wa.me/",
  },
  {
    name: "E-mail",
    weight: 0.06,
    utmSource: "email",
    utmMedium: "newsletter",
    utmCampaign: "lista-jfv",
    referrer: "https://mail.google.com/",
  },
  {
    name: "Outras",
    weight: 0.06,
    utmSource: "parceiro",
    utmMedium: "referral",
    utmCampaign: "afiliados",
    referrer: "https://parceiro.example/",
  },
];

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function weightedPick<T extends { weight: number }>(items: T[], random: () => number): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
}

export function buildDemoEvents(days: string[]): StoredEvent[] {
  if (days.length === 0) return [];

  const random = createRandom(20261109);
  const events: StoredEvent[] = [];
  const visitors = 190;

  for (let index = 0; index < visitors; index += 1) {
    const visitorId = `demo-v${index + 1}`;
    const firstDayIndex = Math.floor(random() * days.length);
    const source = weightedPick(SOURCES, random);

    const activeDays = days.slice(firstDayIndex).filter(() => random() < 0.34);
    if (activeDays.length === 0) activeDays.push(days[firstDayIndex]);

    for (const day of activeDays) {
      const hour = 8 + Math.floor(random() * 15);
      const minute = Math.floor(random() * 60);
      const ts = new Date(
        `${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-03:00`
      ).toISOString();

      const base = {
        visitorId,
        sessionId: `demo-s${index + 1}-${day}`,
        page: random() < 0.18 ? "/aplicacao" : random() < 0.3 ? "/aceleracao" : "/",
        device: random() < 0.74 ? ("mobile" as const) : ("desktop" as const),
        ts,
        day,
        demo: true,
        utmSource: source.utmSource || undefined,
        utmMedium: source.utmMedium || undefined,
        utmCampaign: source.utmCampaign || undefined,
        referrer: source.referrer || undefined,
      };

      events.push({ ...base, type: "pageview" });

      if (random() < 0.34) {
        const program = weightedPick(PROGRAMS, random);
        events.push({
          ...base,
          type: "click_programa",
          programId: program.id,
          programName: program.name,
        });
      }

      if (random() < 0.17) {
        events.push({ ...base, type: "click_whatsapp" });
      }

      if (random() < 0.048) {
        events.push({
          ...base,
          type: "form_submit",
          formId: random() < 0.6 ? "aplicacao" : "aceleracao",
        });
      }
    }
  }

  return events.sort((a, b) => a.ts.localeCompare(b.ts));
}
