import { NextResponse } from "next/server";
import { loadMetrics } from "@/lib/analytics/query-metrics";
import { PeriodError } from "@/lib/analytics/period";
import { hasPainelSession } from "@/lib/painel/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportType = "programs" | "sources" | "daily";

function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
}

function percent(value: number | null): string {
  if (value === null) return "novo";
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}

export async function GET(request: Request) {
  if (!hasPainelSession()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = (url.searchParams.get("type") || "programs") as ExportType;
  const onlyDemo = url.searchParams.get("mode") === "demo";

  if (!["programs", "sources", "daily"].includes(type)) {
    return NextResponse.json({ error: "Tipo de exportação inválido." }, { status: 400 });
  }

  try {
    const data = await loadMetrics({
      searchParams: url.searchParams,
      onlyDemo,
    });

    let rows: (string | number | null | undefined)[][] = [];
    let suffix = type;

    if (type === "programs") {
      rows = [
        ["Programa", "Cliques", "Visitantes únicos", "% do total", "Variação %"],
        ...data.programs.map((program) => [
          program.name,
          program.clicks,
          program.visitors,
          percent(program.share),
          percent(program.change),
        ]),
      ];
    } else if (type === "sources") {
      rows = [
        ["Origem", "Visitantes", "% do total"],
        ...data.sources.map((source) => [
          source.name,
          source.visitors,
          percent(source.share),
        ]),
      ];
    } else {
      rows = [
        [
          "Dia",
          "Visitantes",
          "Pageviews",
          "Conversões",
          "Cliques no WhatsApp",
          "Cliques nos programas",
          "Taxa de conversão %",
        ],
        ...data.daily.map((day) => [
          day.date,
          day.visitors,
          day.pageviews,
          day.conversions,
          day.whatsappClicks,
          day.programClicks,
          percent(day.conversionRate),
        ]),
      ];
    }

    const filename = `jfv-${suffix}-${data.period.from}-a-${data.period.to}.csv`;
    const csv = toCsv(rows);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof PeriodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[painel] Erro ao exportar CSV:", error);
    return NextResponse.json(
      { error: "Não foi possível exportar agora." },
      { status: 500 }
    );
  }
}
