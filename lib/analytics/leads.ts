import { supabaseAdmin, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase";
import { addDays, dayStartISO, todayLocal } from "./time";

/* ============================================================
   Leads reais dos formulários (Mentoria e Aceleração).

   Lê as tabelas `leads` e `leads_aceleracao` com a service role.
   Se as tabelas não existirem, o painel continua funcionando e
   mostra um aviso amigável em vez de quebrar.
   ============================================================ */

export type LeadProgram = "mentoria" | "aceleracao";

export type PainelLead = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company?: string;
  program: LeadProgram;
  programLabel: string;
  origem?: string;
  createdAt: string;
};

export type LeadsCounts = {
  total: number;
  mentoria: number;
  aceleracao: number;
};

export type LeadsResult = {
  leads: PainelLead[];
  counts: LeadsCounts;
  /** Leads recebidos no mês corrente (para a meta mensal). */
  monthTotal: number;
  available: boolean;
  demo: boolean;
};

const PROGRAM_LABELS: Record<LeadProgram, string> = {
  mentoria: "Do Zero aos 10k",
  aceleracao: "Aceleração Comercial",
};

const EMPTY_COUNTS: LeadsCounts = { total: 0, mentoria: 0, aceleracao: 0 };

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function isMissingTable(error: unknown): boolean {
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
    code === "PGRST205" ||
    code === "42P01" ||
    normalized.includes("could not find the table") ||
    normalized.includes("does not exist")
  );
}

function mapRow(
  row: Record<string, unknown>,
  program: LeadProgram
): PainelLead {
  return {
    id: text(row.id),
    name: text(row.nome) || "Sem nome",
    email: text(row.email),
    whatsapp: text(row.whatsapp),
    company: text(row.empresa) || text(row.agencia) || undefined,
    program,
    programLabel: PROGRAM_LABELS[program],
    origem: text(row.origem) || undefined,
    createdAt: text(row.created_at) || new Date().toISOString(),
  };
}

async function queryTable(
  table: "leads" | "leads_aceleracao",
  program: LeadProgram,
  fromISO: string,
  toISO: string,
  limit: number
): Promise<{ available: boolean; rows: PainelLead[] }> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .gte("created_at", fromISO)
    .lt("created_at", toISO)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return { available: false, rows: [] };
    throw new Error(error.message);
  }

  return {
    available: true,
    rows: (data ?? []).map((row) =>
      mapRow(row as Record<string, unknown>, program)
    ),
  };
}

async function countTable(
  table: "leads" | "leads_aceleracao",
  fromISO: string,
  toISO: string
): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("id", { head: true, count: "exact" })
    .gte("created_at", fromISO)
    .lt("created_at", toISO);

  if (error) {
    if (isMissingTable(error)) return 0;
    throw new Error(error.message);
  }

  return count ?? 0;
}

function demoLeads(): LeadsResult {
  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const samples: Array<Omit<PainelLead, "programLabel">> = [
    {
      id: "demo-lead-1",
      name: "Ana (exemplo)",
      email: "ana.exemplo@dominio.com",
      whatsapp: "5543999990001",
      company: "Agência Exemplo",
      program: "aceleracao",
      origem: "instagram",
      createdAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: "demo-lead-2",
      name: "Bruno (exemplo)",
      email: "bruno.exemplo@dominio.com",
      whatsapp: "5543999990002",
      program: "mentoria",
      origem: "google",
      createdAt: new Date(now - 7 * hour).toISOString(),
    },
    {
      id: "demo-lead-3",
      name: "Carla (exemplo)",
      email: "carla.exemplo@dominio.com",
      whatsapp: "5543999990003",
      company: "Loja Exemplo",
      program: "aceleracao",
      origem: "instagram",
      createdAt: new Date(now - 26 * hour).toISOString(),
    },
    {
      id: "demo-lead-4",
      name: "Diego (exemplo)",
      email: "diego.exemplo@dominio.com",
      whatsapp: "5543999990004",
      program: "mentoria",
      origem: "direto",
      createdAt: new Date(now - 30 * hour).toISOString(),
    },
    {
      id: "demo-lead-5",
      name: "Elisa (exemplo)",
      email: "elisa.exemplo@dominio.com",
      whatsapp: "5543999990005",
      company: "Consultoria Exemplo",
      program: "aceleracao",
      origem: "email",
      createdAt: new Date(now - 50 * hour).toISOString(),
    },
    {
      id: "demo-lead-6",
      name: "Felipe (exemplo)",
      email: "felipe.exemplo@dominio.com",
      whatsapp: "5543999990006",
      program: "mentoria",
      origem: "whatsapp",
      createdAt: new Date(now - 74 * hour).toISOString(),
    },
  ];

  const leads = samples.map((lead) => ({
    ...lead,
    programLabel: PROGRAM_LABELS[lead.program],
  }));

  return {
    leads,
    counts: {
      total: leads.length,
      mentoria: leads.filter((lead) => lead.program === "mentoria").length,
      aceleracao: leads.filter((lead) => lead.program === "aceleracao").length,
    },
    monthTotal: leads.length,
    available: true,
    demo: true,
  };
}

export async function fetchPainelLeads(options: {
  fromDay: string;
  toDay: string;
  limit?: number;
  onlyDemo?: boolean;
}): Promise<LeadsResult> {
  if (options.onlyDemo) return demoLeads();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return {
      leads: [],
      counts: EMPTY_COUNTS,
      monthTotal: 0,
      available: false,
      demo: false,
    };
  }

  const limit = Math.min(100, Math.max(1, options.limit ?? 50));
  const fromISO = dayStartISO(options.fromDay);
  const toISO = dayStartISO(addDays(options.toDay, 1));

  const today = todayLocal();
  const monthFromISO = dayStartISO(`${today.slice(0, 7)}-01`);
  const monthToISO = dayStartISO(addDays(today, 1));

  try {
    const [
      mentoria,
      aceleracao,
      mentoriaCount,
      aceleracaoCount,
      mentoriaMonth,
      aceleracaoMonth,
    ] = await Promise.all([
      queryTable("leads", "mentoria", fromISO, toISO, limit),
      queryTable("leads_aceleracao", "aceleracao", fromISO, toISO, limit),
      countTable("leads", fromISO, toISO).catch(() => 0),
      countTable("leads_aceleracao", fromISO, toISO).catch(() => 0),
      countTable("leads", monthFromISO, monthToISO).catch(() => 0),
      countTable("leads_aceleracao", monthFromISO, monthToISO).catch(() => 0),
    ]);

    const leads = [...mentoria.rows, ...aceleracao.rows]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);

    return {
      leads,
      counts: {
        total: mentoriaCount + aceleracaoCount,
        mentoria: mentoriaCount,
        aceleracao: aceleracaoCount,
      },
      monthTotal: mentoriaMonth + aceleracaoMonth,
      available: mentoria.available || aceleracao.available,
      demo: false,
    };
  } catch (error) {
    console.warn("[painel] não foi possível carregar os leads:", error);
    return {
      leads: [],
      counts: EMPTY_COUNTS,
      monthTotal: 0,
      available: false,
      demo: false,
    };
  }
}
