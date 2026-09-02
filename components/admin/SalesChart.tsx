"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data: { day: string; amount: number }[];
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF2D87" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#FF2D87" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={{ stroke: "#2a2a2a" }}
            axisLine={{ stroke: "#2a2a2a" }}
          />
          <YAxis
            tick={{ fill: "#888", fontSize: 11 }}
            tickLine={{ stroke: "#2a2a2a" }}
            axisLine={{ stroke: "#2a2a2a" }}
            tickFormatter={(v) => `R$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161616",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
            }}
            labelStyle={{ color: "#888" }}
            formatter={(value: number) => [formatBRL(value), "Receita"]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#FF2D87"
            strokeWidth={2}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}