import { NextResponse } from "next/server";
import { readGoal, writeGoal } from "@/lib/painel/goal";
import { hasPainelSession } from "@/lib/painel/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasPainelSession()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const goal = await readGoal();
  return NextResponse.json(
    { goal },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: Request) {
  if (!hasPainelSession()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const raw = (body as { goal?: unknown } | null)?.goal;
  let goal: number | null = null;

  if (raw !== null && raw !== undefined && raw !== "") {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
      return NextResponse.json(
        { error: "Informe uma meta entre 0 e 1.000.000." },
        { status: 400 }
      );
    }
    goal = Math.round(value);
  }

  try {
    await writeGoal(goal);
    return NextResponse.json(
      { goal },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[painel] Erro ao salvar a meta:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar a meta agora." },
      { status: 500 }
    );
  }
}
