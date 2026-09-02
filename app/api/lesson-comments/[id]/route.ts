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

const patchSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  is_hidden: z.boolean().optional(),
});

// PATCH /api/lesson-comments/[id]
// - Dono pode editar o conteúdo
// - Admin pode ocultar/mostrar (is_hidden)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    // Busca comentário existente
    const { data: existing } = await supabaseAdmin
      .from("lesson_comments")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    // Verifica se é admin
    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const isOwner = existing.author_auth_id === user.id;
    const isAdmin = !!admin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    // Monta o update respeitando permissões:
    // - Dono só pode editar conteúdo
    // - Admin pode editar conteúdo E is_hidden
    const updateData: Record<string, unknown> = {};

    if (parsed.data.content !== undefined) {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Sem permissão para editar." }, { status: 403 });
      }
      updateData.content = parsed.data.content.trim();
    }

    if (parsed.data.is_hidden !== undefined) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Só admin pode ocultar." }, { status: 403 });
      }
      updateData.is_hidden = parsed.data.is_hidden;
    }

    const { data, error } = await supabaseAdmin
      .from("lesson_comments")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ comment: data });
  } catch (err) {
    console.error("Erro ao atualizar comentário:", err);
    return NextResponse.json({ error: "Erro ao atualizar comentário." }, { status: 500 });
  }
}

// DELETE /api/lesson-comments/[id]
// Dono ou admin podem apagar
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = getBearer(req);
  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const supabase = getUserClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  // Busca comentário
  const { data: existing } = await supabaseAdmin
    .from("lesson_comments")
    .select("author_auth_id")
    .eq("id", params.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }

  // Verifica admin
  const { data: admin } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const isOwner = existing.author_auth_id === user.id;
  const isAdmin = !!admin;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("lesson_comments")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("Erro ao deletar comentário:", error);
    return NextResponse.json({ error: "Erro ao deletar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}