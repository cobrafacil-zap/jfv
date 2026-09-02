import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().url().or(z.literal("")),
});

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("key, value, updated_at")
    .order("key");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = settingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        { key: parsed.data.key, value: parsed.data.value || null },
        { onConflict: "key" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ setting: data });
  } catch (err) {
    console.error("Erro ao salvar configuração:", err);
    return NextResponse.json(
      { error: "Erro ao salvar configuração." },
      { status: 500 }
    );
  }
}
