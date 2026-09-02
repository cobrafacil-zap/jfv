import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

/**
 * Garante que a request vem de um admin. Retorna NextResponse de erro
 * ou null se estiver tudo certo.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
