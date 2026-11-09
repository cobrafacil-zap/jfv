"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Download,
  ExternalLink,
  LogOut,
  MessageCircle,
  Moon,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import type { Metrics, ProgramRow } from "@/lib/analytics/aggregate";
import {
  addDays,
  isValidDay,
  todayLocal,
} from "@/lib/analytics/time";
import { usePainelTheme } from "./theme";
import { BarList, Donut, Sparkline } from "./Charts";

type ApiMetrics = Metrics & {
  period: { from: string; to: string; days: number };
  previousPeriod: { from: string; to: string; days: string[] };
  mode: "real" | "demo";
  demoAvailable: boolean;
  storage: "table" | "kv" | "file";
  truncated: boolean;
  updatedAt: string;
};

type SortKey = "name" | "clicks" | "share" | "change";
type SortDirection = "asc" | "desc";

const PRESETS = [
  { label: "7 dias", days: 7 },
  { label: "14 dias", days: 14 },
  { label: "30 dias", days: 30 },
];

const SOURCE_COLORS: Record<string, string> = {
  Instagram: "#8b5cf6",
  Google: "#2563eb",
  Direto: "#64748b",
  "E-mail": "#f59e0b",
  WhatsApp: "#16a34a",
  Outras: "#94a3b8",
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function differentPeople(value: number): string {
  return value === 1
    ? "1 pessoa diferente"
    : `${formatNumber(value)} pessoas diferentes`;
}

function clickers(value: number): string {
  return value === 1
    ? "1 pessoa clicou"
    : `${formatNumber(value)} pessoas clicaram`;
}

function formatDateBR(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function relativeTime(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

function Delta({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="pnl-delta pnl-delta--new">novo</span>;
  }

  if (Math.abs(value) < 0.05) {
    return <span className="pnl-delta pnl-delta--flat">—</span>;
  }

  const up = value > 0;

  return (
    <span className={`pnl-delta ${up ? "pnl-delta--up" : "pnl-delta--down"}`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {formatPercent(Math.abs(value))}
    </span>
  );
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="pnl-trend pnl-trend--new">novo</span>;
  }

  if (Math.abs(value) < 0.05) {
    return <span className="pnl-trend pnl-trend--flat">—</span>;
  }

  const up = value > 0;

  return (
    <span className={`pnl-trend ${up ? "pnl-trend--up" : "pnl-trend--down"}`}>
      {up ? "▲" : "▼"} {formatPercent(Math.abs(value))}
    </span>
  );
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) return <span className="pnl-sort-icon">↕</span>;
  return <span className="pnl-sort-icon is-active">{direction === "asc" ? "↑" : "↓"}</span>;
}

function DashboardSkeleton() {
  return (
    <>
      <div className="pnl-cards">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="pnl-card pnl-skeleton-card">
            <div className="pnl-skeleton pnl-skeleton--icon" />
            <div className="pnl-skeleton pnl-skeleton--label" />
            <div className="pnl-skeleton pnl-skeleton--value" />
            <div className="pnl-skeleton pnl-skeleton--line" />
          </div>
        ))}
      </div>
      <div className="pnl-row pnl-row--2">
        <div className="pnl-card pnl-skeleton-panel">
          <div className="pnl-skeleton pnl-skeleton--title" />
          <div className="pnl-skeleton pnl-skeleton--chart" />
        </div>
        <div className="pnl-card pnl-skeleton-panel">
          <div className="pnl-skeleton pnl-skeleton--title" />
          <div className="pnl-skeleton pnl-skeleton--chart" />
        </div>
      </div>
    </>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = usePainelTheme();

  const [data, setData] = useState<ApiMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"real" | "demo">("real");
  const [preset, setPreset] = useState<number | "custom">(7);
  const [period, setPeriod] = useState<{ from: string; to: string } | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("clicks");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [now, setNow] = useState(() => Date.now());
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(
    async (from: string, to: string, nextMode: "real" | "demo") => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/painel/metrics?from=${encodeURIComponent(
            from
          )}&to=${encodeURIComponent(to)}&mode=${nextMode}`,
          { cache: "no-store" }
        );

        if (response.status === 401) {
          router.replace("/painel/login?next=/painel");
          return;
        }

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.error || "Não foi possível carregar as métricas."
          );
        }

        setData(payload as ApiMetrics);
        setPeriod({ from, to });
        setMode(nextMode);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as métricas."
        );
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const to = todayLocal();
    const from = addDays(to, -6);
    setCustomFrom(from);
    setCustomTo(to);
    void load(from, to, "real");
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const selectPreset = (days: number) => {
    const to = todayLocal();
    const from = addDays(to, -(days - 1));
    setPreset(days);
    void load(from, to, mode);
  };

  const openCustom = () => {
    if (period) {
      setCustomFrom(period.from);
      setCustomTo(period.to);
    }
    setCustomOpen((current) => !current);
  };

  const applyCustom = () => {
    if (!isValidDay(customFrom) || !isValidDay(customTo)) {
      setError("Informe uma data inicial e uma data final válidas.");
      return;
    }

    if (customFrom > customTo) {
      setError("A data inicial não pode ser posterior à data final.");
      return;
    }

    setPreset("custom");
    setCustomOpen(false);
    void load(customFrom, customTo, mode);
  };

  const refresh = () => {
    if (period) void load(period.from, period.to, mode);
  };

  const enterDemo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/painel/demo", { method: "POST" });

      if (response.status === 401) {
        router.replace("/painel/login?next=/painel");
        return;
      }

      if (!response.ok) {
        throw new Error("Não foi possível preparar os dados de demonstração.");
      }

      const to = todayLocal();
      const from = addDays(to, -6);
      setPreset(7);
      await load(from, to, "demo");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível preparar a demonstração."
      );
      setLoading(false);
    }
  };

  const exitDemo = () => {
    const to = todayLocal();
    const from = addDays(to, -6);
    setPreset(7);
    void load(from, to, "real");
  };

  const removeDemo = async () => {
    try {
      await fetch("/api/painel/demo", { method: "DELETE" });
    } catch {
      // mesmo se falhar, sai do modo demonstração
    }

    const to = todayLocal();
    const from = addDays(to, -6);
    setPreset(7);
    void load(from, to, "real");
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/painel/logout", { method: "POST" });
    } finally {
      router.replace("/painel/login");
      router.refresh();
    }
  };

  const exportCsv = (type: "programs" | "sources" | "daily") => {
    if (!period) return;
    window.location.href = `/api/painel/export?type=${type}&from=${period.from}&to=${period.to}&mode=${mode}`;
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "name" ? "asc" : "desc");
  };

  const sortedPrograms = useMemo(() => {
    const programs = [...(data?.programs ?? [])];

    programs.sort((a: ProgramRow, b: ProgramRow) => {
      let comparison = 0;

      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name, "pt-BR");
      } else if (sortKey === "clicks") {
        comparison = a.clicks - b.clicks;
      } else if (sortKey === "share") {
        comparison = a.share - b.share;
      } else {
        const aChange = a.change ?? -Infinity;
        const bChange = b.change ?? -Infinity;
        comparison = aChange - bChange;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return programs;
  }, [data?.programs, sortKey, sortDirection]);

  const cards = data
    ? [
        {
          label: "Total de visitas na página",
          value: formatNumber(data.totals.pageviews),
          detail: differentPeople(data.totals.visitors),
          change: data.changes.pageviews,
          icon: Users,
          color: "#2563eb",
          sparkline: data.sparklines.pageviews,
          tooltip: false,
        },
        {
          label: "Chamadas no WhatsApp",
          value: formatNumber(data.totals.whatsappClicks),
          detail: clickers(data.totals.whatsappVisitors),
          change: data.changes.whatsappClicks,
          icon: MessageCircle,
          color: "#16a34a",
          sparkline: data.sparklines.whatsapp,
          tooltip: true,
        },
        {
          label: "Clique nos programas",
          value: formatNumber(data.totals.programClicks),
          detail: clickers(data.totals.programVisitors),
          change: data.changes.programClicks,
          icon: MousePointerClick,
          color: "#7c3aed",
          sparkline: data.sparklines.programClicks,
          tooltip: false,
        },
        {
          label: "Formulários Preenchidos",
          value: formatNumber(data.totals.formSubmits),
          detail: `${formatPercent(data.totals.conversionRate)} dos visitantes preencheram`,
          change: data.changes.conversionRate,
          icon: ClipboardCheck,
          color: "#0ea5e9",
          sparkline: data.sparklines.conversionRate,
          tooltip: false,
        },
      ]
    : [];

  const periodLabel = data
    ? `${formatDateBR(data.period.from)} a ${formatDateBR(data.period.to)}`
    : "Carregando período…";

  return (
    <div className="pnl" data-theme={theme}>
      <header className="pnl-topbar">
        <div className="pnl-brand">
          <span className="pnl-brand-mark">JFV</span>
          <div className="pnl-brand-text">
            <strong>Painel de métricas</strong>
            <span>Priscila Sinópolis · jfv.smdigtal.com</span>
          </div>
        </div>

        <div className="pnl-topbar-actions">
          <a
            className="pnl-icon-btn pnl-icon-btn--wide"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={15} />
            <span>Ver site</span>
          </a>
          <button
            type="button"
            className="pnl-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
            title={theme === "light" ? "Modo escuro" : "Modo claro"}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            type="button"
            className="pnl-icon-btn pnl-icon-btn--wide"
            onClick={logout}
            disabled={loggingOut}
          >
            <LogOut size={15} />
            <span>{loggingOut ? "Saindo…" : "Sair"}</span>
          </button>
        </div>
      </header>

      <div className="pnl-toolbar">
        <div className="pnl-toolbar-left">
          <div className="pnl-periods" role="group" aria-label="Período">
            {PRESETS.map((item) => (
              <button
                key={item.days}
                type="button"
                className={`pnl-period-btn${
                  preset === item.days ? " is-active" : ""
                }`}
                onClick={() => selectPreset(item.days)}
                disabled={loading}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className={`pnl-period-btn${preset === "custom" ? " is-active" : ""}`}
              onClick={openCustom}
              disabled={loading}
            >
              <CalendarDays size={14} />
              Personalizado
            </button>
          </div>

          <span className="pnl-period-label">{periodLabel}</span>
        </div>

        <button
          type="button"
          className="pnl-refresh"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "is-spinning" : ""} />
          {loading ? "Atualizando…" : "Atualizar"}
        </button>
      </div>

      {customOpen && (
        <div className="pnl-custom-panel">
          <label>
            De
            <input
              type="date"
              value={customFrom}
              max={todayLocal()}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
          </label>
          <label>
            Até
            <input
              type="date"
              value={customTo}
              max={todayLocal()}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </label>
          <button type="button" className="pnl-btn pnl-btn--primary" onClick={applyCustom}>
            Aplicar
          </button>
          <button
            type="button"
            className="pnl-icon-btn"
            onClick={() => setCustomOpen(false)}
            aria-label="Fechar seletor de datas"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {mode === "demo" && (
        <div className="pnl-demo-banner">
          <Sparkles size={16} />
          <span>
            <strong>Modo demonstração.</strong> Os números são fictícios, para você
            conhecer o painel antes de ter tráfego real.
          </span>
          <div className="pnl-demo-actions">
            <button type="button" className="pnl-text-btn" onClick={removeDemo}>
              Remover demonstração
            </button>
            <button type="button" className="pnl-text-btn" onClick={exitDemo}>
              Sair da demonstração
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="pnl-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="pnl-text-btn" onClick={refresh}>
            Tentar novamente
          </button>
        </div>
      )}

      {data?.truncated && (
        <div className="pnl-alert pnl-alert--soft">
          <span>
            Este período tem muitos eventos. Os números podem estar parcialmente
            agregados.
          </span>
        </div>
      )}

      <main className="pnl-main">
        {!data && loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="pnl-cards">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.label} className="pnl-card pnl-stat">
                    <div className="pnl-stat-top">
                      <span
                        className="pnl-stat-icon"
                        style={{
                          color: card.color,
                          background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
                        }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="pnl-stat-label">{card.label}</span>
                    </div>

                    <strong className="pnl-stat-value">{card.value}</strong>
                    <span className="pnl-stat-detail">{card.detail}</span>

                    <div className="pnl-stat-foot">
                      <Delta value={card.change} />
                      <span className="pnl-stat-compare">vs. período anterior</span>
                    </div>

                    <Sparkline
                      values={card.sparkline}
                      color={card.color}
                      labels={data?.daily.map((day) => day.label)}
                      showTooltip={card.tooltip}
                      valueSuffix={
                        card.label === "Chamadas no WhatsApp" ? " chamadas" : ""
                      }
                    />
                  </article>
                );
              })}
            </div>

            {data && !data.hasData && mode === "real" ? (
              <section className="pnl-card pnl-empty">
                <div className="pnl-empty-icon">
                  <BarChart3 size={28} />
                </div>
                <h1>Seu painel está pronto para medir</h1>
                <p>
                  O rastreamento já está ativo. Assim que o site receber visitas,
                  os números aparecem aqui automaticamente.
                </p>

                <div className="pnl-empty-grid">
                  <div>
                    <strong>O que já está sendo medido</strong>
                    <ul>
                      <li>Total de visitas na página</li>
                      <li>Origem do tráfego (Instagram, Google, direto…)</li>
                      <li>Clique nos programas</li>
                      <li>Chamadas no WhatsApp</li>
                      <li>Formulários preenchidos</li>
                    </ul>
                  </div>
                  <div className="pnl-empty-hint-box">
                    <strong>Como testar agora</strong>
                    <p>
                      Abra o site com <code>?utm_source=instagram</code>, clique em
                      um programa e em um botão de WhatsApp. Em alguns segundos os
                      eventos aparecem aqui.
                    </p>
                  </div>
                </div>

                <div className="pnl-empty-actions">
                  <button
                    type="button"
                    className="pnl-btn pnl-btn--primary"
                    onClick={enterDemo}
                  >
                    <Sparkles size={16} />
                    Ver com dados de demonstração
                  </button>
                  <a className="pnl-btn" href="/" target="_blank" rel="noopener noreferrer">
                    Abrir o site
                    <ExternalLink size={14} />
                  </a>
                </div>
              </section>
            ) : (
              <>
                <div className="pnl-row pnl-row--equal">
                  <section className="pnl-card pnl-chart-card">
                    <div className="pnl-chart-head">
                      <div>
                        <h2>Origem do tráfego</h2>
                        <p>De onde vieram os visitantes.</p>
                      </div>
                    </div>

                    <Donut
                      data={data?.sources ?? []}
                      total={data?.totals.visitors ?? 0}
                      colors={SOURCE_COLORS}
                      onExport={() => exportCsv("sources")}
                    />
                  </section>

                  <section className="pnl-card pnl-chart-card">
                    <div className="pnl-chart-head">
                      <div>
                        <h2>Clique nos programas</h2>
                        <p>Qual serviço despertou mais interesse no período.</p>
                      </div>
                      <button
                        type="button"
                        className="pnl-icon-btn pnl-icon-btn--wide"
                        onClick={() => exportCsv("programs")}
                      >
                        <Download size={14} />
                        <span>CSV</span>
                      </button>
                    </div>

                    <BarList
                      data={data?.programs ?? []}
                      total={data?.totals.programClicks ?? 0}
                    />
                  </section>
                </div>

                <div className="pnl-row">
                  <section className="pnl-card pnl-chart-card">
                    <div className="pnl-chart-head">
                      <div>
                        <h2>Detalhamento por programa</h2>
                        <p>Cliques, participação e tendência vs. período anterior.</p>
                      </div>
                      <button
                        type="button"
                        className="pnl-icon-btn pnl-icon-btn--wide"
                        onClick={() => exportCsv("programs")}
                      >
                        <Download size={14} />
                        <span>CSV</span>
                      </button>
                    </div>

                    <div className="pnl-table-wrap">
                      <table className="pnl-table">
                        <thead>
                          <tr>
                            <th>
                              <button type="button" onClick={() => toggleSort("name")}>
                                Programa
                                <SortIndicator
                                  active={sortKey === "name"}
                                  direction={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="pnl-right">
                              <button type="button" onClick={() => toggleSort("clicks")}>
                                Cliques
                                <SortIndicator
                                  active={sortKey === "clicks"}
                                  direction={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="pnl-right">
                              <button type="button" onClick={() => toggleSort("share")}>
                                %
                                <SortIndicator
                                  active={sortKey === "share"}
                                  direction={sortDirection}
                                />
                              </button>
                            </th>
                            <th className="pnl-right">
                              <button type="button" onClick={() => toggleSort("change")}>
                                Variação
                                <SortIndicator
                                  active={sortKey === "change"}
                                  direction={sortDirection}
                                />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPrograms.map((program) => (
                            <tr key={program.id}>
                              <td>
                                <span className="pnl-table-name">{program.name}</span>
                                <span className="pnl-table-id">{program.id}</span>
                              </td>
                              <td className="pnl-right pnl-strong">
                                {formatNumber(program.clicks)}
                              </td>
                              <td className="pnl-right">
                                {formatPercent(program.share)}
                              </td>
                              <td className="pnl-right">
                                <TrendBadge value={program.change} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </>
            )}
          </>
        )}

        <footer className="pnl-footer">
          <div className="pnl-footer-left">
            <span className="pnl-live-dot" />
            <span>
              Dados atualizados{" "}
              {data ? relativeTime(data.updatedAt, now) : "assim que o painel carregar"}
            </span>
            {data && (
              <span className="pnl-footer-sep">· {formatDateTime(data.updatedAt)}</span>
            )}
          </div>

          <div className="pnl-footer-right">
            {data?.demoAvailable && mode === "real" && (
              <button type="button" className="pnl-text-btn" onClick={enterDemo}>
                <Sparkles size={13} />
                Ver demonstração
              </button>
            )}
            <button
              type="button"
              className="pnl-text-btn"
              onClick={() => exportCsv("daily")}
            >
              <Download size={13} />
              CSV diário
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="pnl-text-btn">
              jfv.smdigtal.com
              <ExternalLink size={12} />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
