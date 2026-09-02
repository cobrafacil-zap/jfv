"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo", color: "bg-accent/15 text-accent" },
  { value: "pending", label: "Pendente", color: "bg-yellow-500/15 text-yellow-400" },
  { value: "refunded", label: "Reembolsado", color: "bg-red-500/15 text-red-400" },
  { value: "inactive", label: "Inativo", color: "bg-bg-elevated text-text-muted" },
];

interface Props {
  studentId: string;
  currentStatus: string;
}

export function StudentStatusForm({ studentId, currentStatus }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  async function update(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar.");
      setStatus(newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-card/50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Status da assinatura
      </p>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const active = opt.value === status;
          return (
            <button
              key={opt.value}
              onClick={() => update(opt.value)}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-bg-elevated text-text-secondary hover:border-accent"
              }`}
            >
              {saving && active ? (
                <Loader2 size={12} className="animate-spin" />
              ) : active ? (
                <Check size={12} />
              ) : null}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
