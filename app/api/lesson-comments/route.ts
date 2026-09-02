import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

function getBearer(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.replace("Bearer ", "");
}

function getUserClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/lesson-comments?lesson_id=xxx
// Lista comentários (não ocultos pra aluno, todos pra admin)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lesson_id");

  if (!lessonId) {
    return NextResponse.json({ error: "lesson_id obrigatório." }, { status: 400 });
  }

  // Admin vê todos (incluindo ocultos)
  const { data: comments, error } = await supabaseAdmin
    .from("lesson_comments")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao listar comentários:", error);
    return NextResponse.json({ error: "Erro ao listar comentários." }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
}

const createSchema = z.object({
  lesson_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parent_id: z.string().uuid().optional().nullable(),
});

// POST /api/lesson-comments
// Cria um comentário
export async function POST(req: Request) {
  const token = getBearer(req);
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const supabase = getUserClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    // Verifica se é admin
    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("id, full_name")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const authorRole = admin ? "admin" : "student";

    // Pega nome do autor (admin → full_name, aluno → students.full_name)
    let authorName = user.email?.split("@")[0] || "Aluno";
    if (admin) {
      authorName = admin.full_name || "Suporte";
    } else {
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("full_name")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (student?.full_name) {
        authorName = student.full_name.split(" ")[0]; // só primeiro nome
      }
    }

    const { data, error } = await supabaseAdmin
      .from("lesson_comments")
      .insert({
        lesson_id: parsed.data.lesson_id,
        author_auth_id: user.id,
        author_name: authorName,
        author_role: authorRole,
        content: parsed.data.content.trim(),
        parent_id: parsed.data.parent_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ comment: data });
  } catch (err) {
    console.error("Erro ao criar comentário:", err);
    return NextResponse.json({ error: "Erro ao criar comentário." }, { status: 500 });
  }
}