"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface StudentsFilterProps {
  initialQ: string;
  initialStatus: string;
  counts: {
    all: number;
    active: number;
    pending: number;
    refunded: number;
  };
}

const TABS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "pending", label: "Pendentes" },
  { value: "refunded", label: "Reembolsados" },
];

function getCurrentSearch(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function StudentsFilter({
  initialQ,
  initialStatus,
  counts,
}: StudentsFilterProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  // Debounce da busca
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = getCurrentSearch();
      if (q) params.set("q", q);
      else params.delete("q");
      router.replace(`/admin/alunos?${params.toString()}`);
    }, 300);
    return () => clearTimeout(handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setStatus(value: string) {
    const params = getCurrentSearch();
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.replace(`/admin/alunos?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-lg border border-border bg-bg-card/50 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = tab.value === initialStatus;
          const count = counts[tab.value as keyof typeof counts] || 0;
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-accent text-white shadow-accent-glow-sm"
                  : "border border-border bg-bg-card/50 text-text-secondary hover:border-accent"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 ${
                  active ? "bg-white/20" : "bg-bg-elevated"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
