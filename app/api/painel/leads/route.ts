import { NextResponse } from "next/server";
import { fetchPainelLeads } from "@/lib/analytics/leads";
import { PeriodError, parsePeriod } from "@/lib/analytics/period";
import { hasPainelSession } from "@/lib/painel/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasPainelSession()) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const url = new URL(request.url);
  const onlyDemo = url.searchParams.get("mode") === "demo";
  const requestedLimit = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 50;

  try {
    const period = parsePeriod(url.searchParams);
    const data = await fetchPainelLeads({
      fromDay: period.from,
      toDay: period.to,
      limit,
      onlyDemo,
    });

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof PeriodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    console.error("[painel] Erro ao carregar leads:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os leads agora." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
