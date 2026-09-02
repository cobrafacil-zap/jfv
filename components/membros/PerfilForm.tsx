"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface PerfilFormProps {
  fullName: string;
  email: string;
  phone: string;
}

export function PerfilForm({ fullName, email, phone }: PerfilFormProps) {
  const [name, setName] = useState(fullName);
  const [newPhone, setPhone] = useState(phone);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/aluno/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          phone: newPhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao salvar.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-bg-card/50 p-6"
    >
      <h3 className="font-display text-lg font-bold text-text-primary">
        Dados pessoais
      </h3>
      <p className="mt-1 text-sm text-text-secondary">
        Mantenha seus dados atualizados.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Nome completo
          </label>
          <input
            id="fullName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-border bg-bg-elevated/50 px-4 py-2.5 text-sm text-text-muted"
          />
          <p className="mt-1 text-xs text-text-muted">
            Para trocar de e-mail, entre em contato com o suporte.
          </p>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            value={newPhone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
            <CheckCircle2 size={16} />
            Dados atualizados com sucesso.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}