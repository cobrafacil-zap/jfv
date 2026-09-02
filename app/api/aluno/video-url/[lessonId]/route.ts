import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/aluno/video-url/[lessonId]
// Gera uma signed URL temporária para o vídeo da aula
// Verifica se o aluno está autenticado e ativo
export async function GET(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
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

    // Verifica se aluno está ativo
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

    // Busca a aula
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from("lessons")
      .select("id, video_url, storage_path, course_id, courses!inner(is_published)")
      .eq("id", params.lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: "Aula não encontrada." },
        { status: 404 }
      );
    }

    // Gera signed URL (válida por 1 hora)
    let signedUrl: string | null = null;

    if (lesson.storage_path) {
      const { data, error } = await supabaseAdmin.storage
        .from("lessons")
        .createSignedUrl(lesson.storage_path, 3600);

      if (error) {
        console.error("Erro ao gerar signed URL:", error);
      } else {
        signedUrl = data.signedUrl;
      }
    } else if (lesson.video_url) {
      // Fallback: usa video_url direto (caso antigo)
      signedUrl = lesson.video_url;
    }

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Vídeo não disponível." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("video-url error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar URL do vídeo." },
      { status: 500 }
    );
  }
}