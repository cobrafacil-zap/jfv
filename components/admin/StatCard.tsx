import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        accent
          ? "border-accent/40 bg-gradient-to-br from-accent/10 to-bg-card shadow-accent-glow-sm"
          : "border-border bg-bg-card/50 hover:border-accent/40"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            accent ? "bg-accent-gradient text-white" : "bg-bg-elevated text-accent"
          }`}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendUp ? "text-accent" : "text-red-400"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-text-primary">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}
