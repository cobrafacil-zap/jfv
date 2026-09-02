import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/aluno/progress
// Marca uma aula como assistida (ou atualiza o progresso)
export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { lessonId, watched, progressPercent } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId é obrigatório." },
        { status: 400 }
      );
    }

    // Busca o aluno
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id, status")
      .eq("auth_user_id", user.id)
      .single();

    if (!student || student.status !== "active") {
      return NextResponse.json(
        { error: "Aluno não está ativo." },
        { status: 403 }
      );
    }

    // Marca como assistido se progress >= 80%
    const shouldMarkWatched =
      watched || (progressPercent && progressPercent >= 80);

    const { data, error } = await supabaseAdmin
      .from("student_progress")
      .upsert(
        {
          student_id: student.id,
          lesson_id: lessonId,
          watched: shouldMarkWatched,
          watched_at: shouldMarkWatched ? new Date().toISOString() : null,
        },
        {
          onConflict: "student_id,lesson_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar progresso:", error);
      return NextResponse.json(
        { error: "Erro ao salvar progresso." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, progress: data });
  } catch (error) {
    console.error("progress error:", error);
    return NextResponse.json(
      { error: "Erro ao processar progresso." },
      { status: 500 }
    );
  }
}