import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";
import { isValidHex, DEFAULT_THEME_COLORS, invalidateThemeColorsCache } from "@/lib/theme-colors";

const schema = z.object({
  primary: z.string().refine(isValidHex, "Cor primária inválida"),
  secondary: z.string().refine(isValidHex, "Cor secundária inválida"),
});

const SETTING_KEY = "theme_colors";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", SETTING_KEY)
    .maybeSingle();

  let colors = DEFAULT_THEME_COLORS;
  if (data?.value) {
    try {
      const p = JSON.parse(data.value) as Partial<typeof DEFAULT_THEME_COLORS>;
      colors = {
        primary: (p.primary && isValidHex(p.primary) && p.primary) || DEFAULT_THEME_COLORS.primary,
        secondary: (p.secondary && isValidHex(p.secondary) && p.secondary) || DEFAULT_THEME_COLORS.secondary,
      };
    } catch {
      /* keep default */
    }
  }
  return NextResponse.json({ colors });
}

export async function PUT(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Cores inválidas." },
        { status: 400 }
      );
    }

    const value = JSON.stringify(parsed.data);
    const { error: upsertError } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: SETTING_KEY, value }, { onConflict: "key" });

    if (upsertError) throw upsertError;
    invalidateThemeColorsCache();
    return NextResponse.json({ colors: parsed.data });
  } catch (e) {
    console.error("Erro ao salvar cores do tema:", e);
    return NextResponse.json({ error: "Erro ao salvar cores." }, { status: 500 });
  }
}