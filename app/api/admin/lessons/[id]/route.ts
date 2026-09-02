import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  video_url: z.string().url().optional().nullable(),
  video_path: z.string().optional().nullable(),
  duration_seconds: z.number().int().min(0).optional(),
  order_index: z.number().int().min(0).optional(),
  is_published: z.boolean().optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  thumbnail_path: z.string().optional().nullable(),
  course_id: z.string().uuid().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabaseAdmin
    .from("lessons")
    .select("*, course:courses(id, title)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ lesson: data });
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
      .from("lessons")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ lesson: data });
  } catch (err) {
    console.error("Erro ao atualizar aula:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar aula." },
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

  // Limpa progresso dos alunos
  await supabaseAdmin
    .from("student_progress")
    .delete()
    .eq("lesson_id", params.id);

  const { error } = await supabaseAdmin
    .from("lessons")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
