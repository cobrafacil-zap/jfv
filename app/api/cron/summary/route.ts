import { NextResponse } from "next/server";
import { fetchPainelLeads } from "@/lib/analytics/leads";
import { loadMetrics } from "@/lib/analytics/query-metrics";
import { cleanupOldEvents } from "@/lib/analytics/store";
import { addDays, todayLocal } from "@/lib/analytics/time";
import { readGoal } from "@/lib/painel/goal";
import { sendDailySummary } from "@/lib/painel/summary-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron diário: envia o resumo do dia anterior e remove eventos
 * com mais de um ano.
 *
 * Agendado em `vercel.json`. A Vercel envia automaticamente
 * `Authorization: Bearer $CRON_SECRET`.
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  const token = new URL(request.url).searchParams.get("token");
  return token === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const day = addDays(todayLocal(), -1);
  const searchParams = new URLSearchParams({ from: day, to: day });

  try {
    const [metrics, leads, goal] = await Promise.all([
      loadMetrics({ searchParams, onlyDemo: false }),
      fetchPainelLeads({ fromDay: day, toDay: day, limit: 100 }),
      readGoal(),
    ]);

    const cleanup = await cleanupOldEvents(365).catch((error) => {
      console.warn("[cron] falha na limpeza de eventos:", error);
      return null;
    });

    const result = await sendDailySummary({
      date: day,
      pageviews: metrics.totals.pageviews,
      visitors: metrics.totals.visitors,
      programClicks: metrics.totals.programClicks,
      whatsappClicks: metrics.totals.whatsappClicks,
      formSubmits: metrics.totals.formSubmits,
      conversionRate: metrics.totals.conversionRate,
      leadsTotal: leads.counts.total,
      leadsMentoria: leads.counts.mentoria,
      leadsAceleracao: leads.counts.aceleracao,
      monthLeads: leads.monthTotal,
      goal,
    });

    return NextResponse.json(
      {
        ok: result.ok,
        status: result.status,
        date: day,
        cleanup,
        metrics: {
          pageviews: metrics.totals.pageviews,
          visitors: metrics.totals.visitors,
          programClicks: metrics.totals.programClicks,
          whatsappClicks: metrics.totals.whatsappClicks,
          formSubmits: metrics.totals.formSubmits,
        },
        leads: leads.counts,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[cron] erro no resumo diário:", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o resumo diário." },
      { status: 500 }
    );
  }
}
