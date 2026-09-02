import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  file_path: z.string().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  order_index: z.number().int().min(0).optional(),
  is_published: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabaseAdmin
    .from("bonuses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ bonus: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bonuses")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ bonus: data });
  } catch (err) {
    console.error("Erro ao atualizar bônus:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar bônus." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { error } = await supabaseAdmin
    .from("bonuses")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
