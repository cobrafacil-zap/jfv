import { promises as fs } from "fs";
import path from "path";
import { supabaseAdmin, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase";

/* ============================================================
   Meta mensal de leads.

   Fica em `site_settings` (chave `painel:meta_leads_mensal`).
   Em desenvolvimento sem Supabase, usa um arquivo local.
   ============================================================ */

export const GOAL_KEY = "painel:meta_leads_mensal";

const FILE_PATH =
  process.env.PAINEL_GOAL_FILE ||
  path.join(process.cwd(), ".data", "painel-goal.json");

function parseGoal(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number);
}

export async function readGoal(): Promise<number | null> {
  if (supabaseUrl && supabaseServiceRoleKey) {
    try {
      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", GOAL_KEY)
        .maybeSingle();

      if (!error && data?.value !== undefined) {
        return parseGoal(data.value);
      }
    } catch {
      // cai para o arquivo local
    }
  }

  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return parseGoal(JSON.parse(raw)?.goal);
  } catch {
    return null;
  }
}

export async function writeGoal(goal: number | null): Promise<void> {
  if (supabaseUrl && supabaseServiceRoleKey) {
    if (goal === null) {
      const { error } = await supabaseAdmin
        .from("site_settings")
        .delete()
        .eq("key", GOAL_KEY);

      if (error) {
        throw new Error(`Não foi possível remover a meta: ${error.message}`);
      }
    } else {
      const { error } = await supabaseAdmin
        .from("site_settings")
        .upsert(
          { key: GOAL_KEY, value: String(goal) },
          { onConflict: "key" }
        );

      if (error) {
        throw new Error(`Não foi possível salvar a meta: ${error.message}`);
      }
    }

    return;
  }

  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(
    FILE_PATH,
    JSON.stringify({ goal }, null, 2),
    "utf8"
  );
}
