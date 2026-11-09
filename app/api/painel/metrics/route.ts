import { NextResponse } from "next/server";
import { loadMetrics } from "@/lib/analytics/query-metrics";
import { PeriodError } from "@/lib/analytics/period";
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

  try {
    const data = await loadMetrics({
      searchParams: url.searchParams,
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

    console.error("[painel] Erro ao carregar métricas:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as métricas agora." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
