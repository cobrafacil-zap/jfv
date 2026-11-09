import { NextResponse } from "next/server";
import { buildDemoEvents } from "@/lib/analytics/demo";
import {
  deleteDemoEvents,
  hasDemoEvents,
  insertEvents,
} from "@/lib/analytics/store";
import { addDays, daysBetween, todayLocal } from "@/lib/analytics/time";
import { hasPainelSession } from "@/lib/painel/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!hasPainelSession()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    if (await hasDemoEvents()) {
      return NextResponse.json({ ok: true, seeded: false });
    }

    const today = todayLocal();
    const days = daysBetween(addDays(today, -13), today);
    const events = buildDemoEvents(days);

    await insertEvents(events);

    return NextResponse.json({ ok: true, seeded: true, events: events.length });
  } catch (error) {
    console.error("[painel] Erro ao criar demonstração:", error);
    return NextResponse.json(
      { error: "Não foi possível criar os dados de demonstração." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (!hasPainelSession()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const deleted = await deleteDemoEvents();
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    console.error("[painel] Erro ao remover demonstração:", error);
    return NextResponse.json(
      { error: "Não foi possível remover os dados de demonstração." },
      { status: 500 }
    );
  }
}
