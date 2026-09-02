import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Marca password_set=true e first_access_at
// Usa o token do usuário logado pra identificar o aluno (seguro)
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Cria cliente Supabase com o token do usuário (respeita RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verifica usuário logado
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    // Atualiza o aluno
    const { error: updateError } = await supabaseUser
      .from("students")
      .update({
        password_set: true,
        first_access_at: new Date().toISOString(),
      })
      .eq("auth_user_id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar student:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar cadastro." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("complete-registration error:", error);
    return NextResponse.json(
      { error: "Erro ao processar cadastro." },
      { status: 500 }
    );
  }
}