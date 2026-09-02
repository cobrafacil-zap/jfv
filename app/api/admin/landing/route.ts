import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";
import { LANDING_SECTIONS } from "@/lib/landing-content";

/**
 * Conteúdo dinâmico da landing pública (tabela landing_content).
 * - GET: retorna todas as seções (admin).
 * - PUT: upsert de uma seção { section, content } (admin).
 * O conteúdo da home é lido server-side via supabaseAdmin em
 * getLandingContent() (bypass de RLS); este endpoint serve o editor.
 */

const sectionSchema = z.object({
  section: z.enum(LANDING_SECTIONS),
  content: z.record(z.any()),
});

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabaseAdmin
    .from("landing_content")
    .select("section, content, updated_at")
    .order("section");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sections: data });
}

export async function PUT(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = sectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { section, content } = parsed.data;

    const { data, error: upsertError } = await supabaseAdmin
      .from("landing_content")
      .upsert(
        { section, content },
        { onConflict: "section" }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;
    return NextResponse.json({ section: data });
  } catch (err) {
    console.error("Erro ao salvar conteúdo da landing:", err);
    return NextResponse.json(
      { error: "Erro ao salvar conteúdo." },
      { status: 500 }
    );
  }
}