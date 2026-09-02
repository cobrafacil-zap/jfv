import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentStudent } from "@/lib/auth";

const profileSchema = z.object({
  fullName: z.string().min(2, "Nome muito curto.").max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("students")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", student.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil." },
      { status: 500 }
    );
  }
}