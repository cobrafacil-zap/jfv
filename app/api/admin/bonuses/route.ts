import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const bonusSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  file_url: z.string().url().optional().or(z.literal("")),
  file_path: z.string().optional().or(z.literal("")),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  order_index: z.number().int().min(0).default(0),
  is_published: z.boolean().default(false),
});

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabaseAdmin
    .from("bonuses")
    .select("*")
    .order("order_index");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bonuses: data });
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = bonusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bonuses")
      .insert({
        title: parsed.data.title,
        description: parsed.data.description || null,
        file_url: parsed.data.file_url || null,
        file_path: parsed.data.file_path || null,
        cover_image_url: parsed.data.cover_image_url || null,
        order_index: parsed.data.order_index,
        is_published: parsed.data.is_published,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ bonus: data });
  } catch (err) {
    console.error("Erro ao criar bônus:", err);
    return NextResponse.json(
      { error: "Erro ao criar bônus." },
      { status: 500 }
    );
  }
}
