import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-api";

const updateSchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional().nullable(),
  status: z.enum(["active", "inactive", "refunded", "pending"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("student_id", params.id)
    .order("created_at", { ascending: false });

  // Progresso agregado
  const { data: progress } = await supabaseAdmin
    .from("student_progress")
    .select("lesson_id, watched, watched_at")
    .eq("student_id", params.id);

  return NextResponse.json({
    student,
    payments: payments || [],
    progress: progress || [],
  });
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
      .from("students")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ student: data });
  } catch (err) {
    console.error("Erro ao atualizar aluno:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar aluno." },
      { status: 500 }
    );
  }
}
