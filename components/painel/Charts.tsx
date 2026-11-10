"use client";

import { Fragment, useId, useState } from "react";
import type {
  DailyPoint,
  FunnelStage,
  Heatmap as HeatmapData,
  SourceRow,
} from "@/lib/analytics/aggregate";

/* ============================================================
   Sparkline — mini gráfico de linha usado nos cards.
   ============================================================ */

type SparklineProps = {
  values: number[];
  color?: string;
  labels?: string[];
  height?: number;
  showTooltip?: boolean;
  valueSuffix?: string;
};

export function Sparkline({
  values,
  color = "#2563eb",
  labels,
  height = 46,
  showTooltip = false,
  valueSuffix = "",
}: SparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const width = 120;
  const padding = 4;
  const data = values.length > 0 ? values : [0];
  const max = Math.max(1, ...data);
  const count = data.length;

  const points = data.map((value, index) => ({
    x:
      count === 1
        ? width / 2
        : padding + (index / (count - 1)) * (width - padding * 2),
    y: height - padding - (value / max) * (height - padding * 2),
  }));

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : "";

  const active = hover !== null ? points[hover] : null;

  return (
    <div
      className={`pnl-spark${showTooltip ? " pnl-spark--interactive" : ""}`}
      style={{ height }}
      onMouseMove={(event) => {
        if (!showTooltip) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = Math.min(
          1,
          Math.max(0, (event.clientX - rect.left) / rect.width)
        );
        setHover(Math.round(ratio * (count - 1)));
      }}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="pnl-spark-svg"
        style={{ height }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {area && <path d={area} fill={`url(#${gradientId})`} />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {active && (
          <>
            <line
              x1={active.x}
              y1={0}
              x2={active.x}
              y2={height}
              stroke={color}
              strokeOpacity="0.25"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r="3"
              fill={color}
              stroke="var(--pnl-card)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>

      {showTooltip && hover !== null && (
        <div className="pnl-spark-tooltip">
          {labels?.[hover] ? <span>{labels[hover]}</span> : null}
          <strong>
            {data[hover]}
            {valueSuffix}
          </strong>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   LineChart — visitantes e conversões por dia.
   ============================================================ */

type SeriesKey = "visitors" | "conversions" | "whatsappClicks" | "programClicks";

type LineSeries = {
  key: SeriesKey;
  label: string;
  color: string;
};

type LineChartProps = {
  data: DailyPoint[];
  series: LineSeries[];
  height?: number;
};

function niceMax(value: number): number {
  if (value <= 5) return 5;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const normalized = value / base;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * base;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export function LineChart({ data, series, height = 270 }: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const width = 720;
  const padding = { top: 18, right: 18, bottom: 32, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = 270 - padding.top - padding.bottom;

  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => series.map((item) => point[item.key]))
  );
  const max = niceMax(maxValue);

  const xAt = (index: number) =>
    padding.left +
    (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const yAt = (value: number) =>
    padding.top + innerHeight - (value / max) * innerHeight;

  const grid = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(data.length / 7));
  const active = hover !== null ? data[hover] : null;

  const firstSeries = series[0];
  const firstPoints = data.map((point, index) => ({
    x: xAt(index),
    y: yAt(point[firstSeries.key]),
  }));
  const firstPath = smoothPath(firstPoints);
  const firstArea =
    firstPoints.length > 0
      ? `${firstPath} L ${firstPoints[firstPoints.length - 1].x} ${
          padding.top + innerHeight
        } L ${firstPoints[0].x} ${padding.top + innerHeight} Z`
      : "";

  return (
    <div className="pnl-linechart" style={{ minHeight: height }}>
      <svg
        viewBox={`0 0 ${width} 270`}
        preserveAspectRatio="none"
        className="pnl-linechart-svg"
        style={{ height }}
        role="img"
        aria-label="Gráfico de visitantes e conversões por dia"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={firstSeries.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={firstSeries.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((ratio) => {
          const y = padding.top + innerHeight * ratio;
          const value = Math.round(max * (1 - ratio));
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--pnl-border)"
                strokeWidth="1"
                strokeDasharray={ratio === 1 ? "0" : "4 5"}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="pnl-axis-label"
              >
                {value}
              </text>
            </g>
          );
        })}

        {data.map((point, index) => {
          if (index !== 0 && index !== data.length - 1 && index % labelStep !== 0) {
            return null;
          }
          return (
            <text
              key={point.date}
              x={xAt(index)}
              y={270 - 8}
              textAnchor="middle"
              className="pnl-axis-label"
            >
              {point.label}
            </text>
          );
        })}

        {firstArea && <path d={firstArea} fill={`url(#${gradientId})`} />}

        {series.map((item) => {
          const points = data.map((point, index) => ({
            x: xAt(index),
            y: yAt(point[item.key]),
          }));

          return (
            <g key={item.key}>
              <path
                d={smoothPath(points)}
                fill="none"
                stroke={item.color}
                strokeWidth={item.key === "conversions" ? 2.4 : 2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((point, index) => (
                <circle
                  key={`${item.key}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={data.length > 20 ? 2 : 3}
                  fill={item.color}
                  stroke="var(--pnl-card)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          );
        })}

        {hover !== null && active && (
          <line
            x1={xAt(hover)}
            y1={padding.top}
            x2={xAt(hover)}
            y2={padding.top + innerHeight}
            stroke="var(--pnl-blue)"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}

        <rect
          x={padding.left}
          y={padding.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = Math.min(
              1,
              Math.max(0, (event.clientX - rect.left) / rect.width)
            );
            setHover(Math.round(ratio * Math.max(0, data.length - 1)));
          }}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {hover !== null && active && (
        <div
          className="pnl-line-tooltip"
          style={{
            left: `${(xAt(hover) / width) * 100}%`,
          }}
        >
          <span className="pnl-line-tooltip-date">{active.label}</span>
          {series.map((item) => (
            <span key={item.key} className="pnl-line-tooltip-row">
              <i style={{ background: item.color }} />
              {item.label}
              <strong>{active[item.key]}</strong>
            </span>
          ))}
          <span className="pnl-line-tooltip-row pnl-line-tooltip-row--muted">
            Taxa de conversão
            <strong>{active.conversionRate.toLocaleString("pt-BR")}%</strong>
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Donut — origem do tráfego.
   ============================================================ */

type DonutProps = {
  data: SourceRow[];
  total: number;
  colors: Record<string, string>;
  onExport?: () => void;
};

export function Donut({ data, total, colors, onExport }: DonutProps) {
  const size = 196;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const visible = data.filter((item) => item.visitors > 0);

  return (
    <div className="pnl-donut-wrap">
      <div className="pnl-donut-figure">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="pnl-donut-svg"
          role="img"
          aria-label="Origem do tráfego"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--pnl-track)"
            strokeWidth={stroke}
          />

          {visible.map((item) => {
            const dash = (item.share / 100) * circumference;
            const circle = (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colors[item.name] || "#94a3b8"}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>

        <div className="pnl-donut-center">
          <strong>{total.toLocaleString("pt-BR")}</strong>
          <span>visitantes</span>
        </div>
      </div>

      <div className="pnl-donut-legend">
        {data.map((item) => (
          <div key={item.name} className="pnl-donut-legend-row">
            <span
              className="pnl-donut-dot"
              style={{ background: colors[item.name] || "#94a3b8" }}
            />
            <span className="pnl-donut-legend-name">{item.name}</span>
            <span className="pnl-donut-legend-value">
              {item.visitors.toLocaleString("pt-BR")}
            </span>
            <span className="pnl-donut-legend-share">
              {item.share.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </span>
          </div>
        ))}

        {onExport && (
          <button type="button" className="pnl-text-btn" onClick={onExport}>
            Exportar CSV
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   BarList — ranking de programas.
   ============================================================ */

type BarListProps = {
  data: Array<{
    id: string;
    name: string;
    clicks: number;
    share: number;
  }>;
  total: number;
};

export function BarList({ data, total }: BarListProps) {
  const maxClicks = Math.max(1, ...data.map((item) => item.clicks));

  if (data.length === 0) {
    return <p className="pnl-muted pnl-empty-inline">Nenhum clique registrado.</p>;
  }

  return (
    <div className="pnl-bars">
      {data.map((item, index) => (
        <div key={item.id} className="pnl-bar-row">
          <span className="pnl-bar-rank">{index + 1}</span>
          <div className="pnl-bar-main">
            <div className="pnl-bar-top">
              <span className="pnl-bar-name">{item.name}</span>
              <span className="pnl-bar-count">
                {item.clicks.toLocaleString("pt-BR")}
                <em>
                  {total > 0
                    ? ` · ${item.share.toLocaleString("pt-BR", {
                        maximumFractionDigits: 1,
                      })}%`
                    : ""}
                </em>
              </span>
            </div>
            <div className="pnl-bar-track">
              <span
                className="pnl-bar-fill"
                style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Funnel — etapas até o formulário.
   ============================================================ */

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  if (!stages.some((stage) => stage.value > 0)) {
    return (
      <p className="pnl-muted pnl-empty-inline">
        Nenhuma visita no período para montar o funil.
      </p>
    );
  }

  const max = Math.max(1, ...stages.map((stage) => stage.value));

  return (
    <div className="pnl-funnel">
      {stages.map((stage, index) => (
        <div className="pnl-funnel-step" key={stage.key}>
          <div className="pnl-funnel-top">
            <span className="pnl-funnel-label">{stage.label}</span>
            <span className="pnl-funnel-value">
              {stage.value.toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="pnl-funnel-track">
            <span
              className="pnl-funnel-fill"
              style={{
                width: `${
                  stage.value > 0
                    ? Math.max(2, (stage.value / max) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="pnl-funnel-meta">
            <span>
              {stage.fromStart.toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
              })}
              % das visitas
            </span>
            {index > 0 && (
              <span className={stage.fromPrevious < 40 ? "is-low" : ""}>
                {stage.fromPrevious.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
                % da etapa anterior
              </span>
            )}
          </div>
        </div>
      ))}

      <p className="pnl-funnel-note">
        Cada etapa conta pessoas diferentes. Uma pessoa pode aparecer em mais de
        uma etapa.
      </p>
    </div>
  );
}

/* ============================================================
   Heatmap — melhores dias e horários.
   ============================================================ */

export function Heatmap({ data }: { data: HeatmapData }) {
  const max = Math.max(1, data.max);

  return (
    <div className="pnl-heat">
      <div
        className="pnl-heat-grid"
        style={{
          gridTemplateColumns: `52px repeat(${data.buckets.length}, minmax(0, 1fr))`,
        }}
      >
        <span />
        {data.buckets.map((bucket) => (
          <span key={bucket} className="pnl-heat-head">
            {bucket}
          </span>
        ))}

        {data.weekdays.map((day, weekdayIndex) => (
          <Fragment key={day}>
            <span className="pnl-heat-day">{day}</span>
            {(data.cells[weekdayIndex] ?? []).map((value, bucketIndex) => {
              const ratio = value / max;
              return (
                <span
                  key={`${day}-${bucketIndex}`}
                  className="pnl-heat-cell"
                  style={{
                    background: `rgba(37, 99, 235, ${0.06 + ratio * 0.86})`,
                    color: ratio > 0.55 ? "#ffffff" : "var(--pnl-muted)",
                  }}
                  title={`${day}, ${data.buckets[bucketIndex]}: ${value} visitas`}
                >
                  {value > 0 ? value : ""}
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="pnl-heat-legend">
        <span>Menos movimento</span>
        {[0.08, 0.28, 0.5, 0.72, 0.92].map((ratio) => (
          <i key={ratio} style={{ background: `rgba(37, 99, 235, ${ratio})` }} />
        ))}
        <span>Mais movimento</span>
      </div>
    </div>
  );
}
