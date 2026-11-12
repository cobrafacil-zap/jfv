import { NextResponse } from "next/server";
import { loadMetrics } from "@/lib/analytics/query-metrics";
import { fetchPainelLeads } from "@/lib/analytics/leads";
import { PeriodError } from "@/lib/analytics/period";
import { hasPainelSession } from "@/lib/painel/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportType =
  | "programs"
  | "sources"
  | "daily"
  | "campaigns"
  | "devices"
  | "placements"
  | "pages"
  | "scroll"
  | "heatmap"
  | "leads";

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

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export async function GET(request: Request) {
  if (!hasPainelSession()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = (url.searchParams.get("type") || "programs") as ExportType;
  const onlyDemo = url.searchParams.get("mode") === "demo";

  if (!["programs", "sources", "daily", "campaigns", "devices", "placements", "pages", "scroll", "heatmap", "leads"].includes(type)) {
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
    } else if (type === "daily") {
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
    } else if (type === "campaigns") {
      rows = [
        [
          "Origem",
          "Mídia",
          "Campanha",
          "Pessoas",
          "Cliques em programas",
          "Formulários",
          "Conversão %",
          "% das visitas",
        ],
        ...data.campaigns.map((campaign) => [
          campaign.source,
          campaign.medium,
          campaign.campaign,
          campaign.visitors,
          campaign.programClicks,
          campaign.formSubmits,
          percent(campaign.conversionRate),
          percent(campaign.share),
        ]),
      ];
    } else if (type === "devices") {
      rows = [
        ["Dispositivo", "Pessoas", "Visitas", "Formulários", "Conversão %", "% das visitas"],
        ...data.devices.map((device) => [
          device.label,
          device.visitors,
          device.pageviews,
          device.formSubmits,
          percent(device.conversionRate),
          percent(device.share),
        ]),
      ];
    } else if (type === "placements") {
      rows = [
        ["Botão de WhatsApp", "Cliques", "Pessoas", "% dos cliques"],
        ...data.placements.map((placement) => [
          placement.name,
          placement.clicks,
          placement.visitors,
          percent(placement.share),
        ]),
      ];
    } else if (type === "pages") {
      rows = [
        ["Página", "Visitas", "Pessoas", "Formulários", "Conversão %", "% das visitas"],
        ...data.pages.map((page) => [
          page.label,
          page.pageviews,
          page.visitors,
          page.formSubmits,
          percent(page.conversionRate),
          percent(page.share),
        ]),
      ];
    } else if (type === "scroll") {
      rows = [
        [
          "Profundidade",
          "Pessoas",
          "% das visitas",
          "% da faixa anterior",
        ],
        ...data.scrollDepth.map((row) => [
          row.label,
          row.visitors,
          percent(row.share),
          percent(row.fromPrevious),
        ]),
      ];
    } else if (type === "heatmap") {
      rows = [
        ["Dia", ...data.heatmap.buckets],
        ...data.heatmap.weekdays.map((weekday, index) => [
          weekday,
          ...(data.heatmap.cells[index] ?? []),
        ]),
      ];
    } else {
      const leads = await fetchPainelLeads({
        fromDay: data.period.from,
        toDay: data.period.to,
        limit: 100,
        onlyDemo,
      });

      rows = [
        ["Nome", "Email", "WhatsApp", "Empresa", "Programa", "Origem", "Recebido em"],
        ...leads.leads.map((lead) => [
          lead.name,
          lead.email,
          lead.whatsapp,
          lead.company ?? "",
          lead.programLabel,
          lead.origem ?? "",
          formatDateTime(lead.createdAt),
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
