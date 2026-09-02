import Link from "next/link";
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabaseAdmin } from "@/lib/supabase";
import { StatCard } from "@/components/admin/StatCard";
import { SalesChart } from "@/components/admin/SalesChart";

export const dynamic = "force-dynamic";

function formatCurrency(value: number | null | undefined) {
  const n = value ?? 0;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function AdminDashboardPage() {
  // Métricas principais (consultas em paralelo)
  const [
    { count: totalActive },
    { count: totalAll },
    { data: paymentsAll },
    { data: paymentsMonth },
    { data: recentStudents },
    { data: salesByDay },
  ] = await Promise.all([
    supabaseAdmin
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabaseAdmin
      .from("students")
      .select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("payments")
      .select("amount, status, paid_at")
      .eq("status", "approved"),
    supabaseAdmin
      .from("payments")
      .select("amount, status, paid_at")
      .eq("status", "approved")
      .gte("paid_at", new Date(new Date().setDate(1)).toISOString()),
    supabaseAdmin
      .from("students")
      .select("id, full_name, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabaseAdmin
      .from("payments")
      .select("amount, paid_at")
      .eq("status", "approved")
      .gte(
        "paid_at",
        new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
      )
      .order("paid_at"),
  ]);

  const totalRevenue = (paymentsAll || []).reduce(
    (acc, p) => acc + (p.amount || 0),
    0
  );
  const monthRevenue = (paymentsMonth || []).reduce(
    (acc, p) => acc + (p.amount || 0),
    0
  );
  const monthCount = paymentsMonth?.length || 0;
  const conversion =
    (totalAll || 0) > 0
      ? Math.round(((totalActive || 0) / (totalAll || 1)) * 100)
      : 0;

  // Agrupa vendas por dia (últimos 30 dias)
  const salesMap = new Map<string, number>();
  for (const p of salesByDay || []) {
    if (!p.paid_at) continue;
    const day = p.paid_at.slice(0, 10);
    salesMap.set(day, (salesMap.get(day) || 0) + (p.amount || 0));
  }
  const chartData = Array.from(salesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, amount]) => ({
      day: format(new Date(day + "T00:00:00"), "dd/MM"),
      amount,
    }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Visão geral</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
            Dashboard
          </h1>
        </div>
        <Link
          href="/admin/alunos"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110"
        >
          Ver alunos
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alunos ativos"
          value={totalActive || 0}
          icon={Users}
          accent
        />
        <StatCard
          label="Receita total"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          label="Vendas no mês"
          value={`${monthCount} · ${formatCurrency(monthRevenue)}`}
          icon={ShoppingCart}
        />
        <StatCard
          label="Taxa de conversão"
          value={`${conversion}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Gráfico de vendas */}
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                Vendas nos últimos 30 dias
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">
                Receita diária de pagamentos aprovados.
              </p>
            </div>
            <Activity size={18} className="text-accent" />
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-text-muted">
              Nenhuma venda registrada nos últimos 30 dias.
            </div>
          ) : (
            <SalesChart data={chartData} />
          )}
        </div>

        {/* Últimos alunos */}
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-text-primary">
              Últimos alunos
            </h3>
            <Link
              href="/admin/alunos"
              className="text-xs font-semibold text-accent hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {(!recentStudents || recentStudents.length === 0) ? (
            <div className="rounded-lg border border-border bg-bg-elevated/40 p-6 text-center text-sm text-text-muted">
              Nenhum aluno cadastrado ainda.
            </div>
          ) : (
            <ul className="space-y-3">
              {recentStudents.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/alunos/${s.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-bg-elevated"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-sm font-bold text-accent">
                      {s.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {s.full_name}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {s.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        s.status === "active"
                          ? "bg-accent/15 text-accent"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {s.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
