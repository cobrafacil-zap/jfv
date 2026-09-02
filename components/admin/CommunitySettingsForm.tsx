"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircle, Save } from "lucide-react";

interface CommunitySettingsFormProps {
  initialValue: string;
}

export function CommunitySettingsForm({ initialValue }: CommunitySettingsFormProps) {
  const router = useRouter();
  const [whatsappUrl, setWhatsappUrl] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setWhatsappUrl(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "community_whatsapp_url",
          value: whatsappUrl.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar.");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-border bg-bg-card/50 p-6"
    >
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-accent" />
        <h2 className="font-display text-lg font-bold text-text-primary">
          Comunidade Gratuita
        </h2>
      </div>
      <p className="-mt-3 text-sm text-text-secondary">
        Configure o link do grupo de WhatsApp que aparece na área de membros.
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Link do grupo do WhatsApp
        </label>
        <input
          type="url"
          value={whatsappUrl}
          onChange={(e) => setWhatsappUrl(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
          placeholder="https://chat.whatsapp.com/..."
        />
        <p className="mt-1 text-xs text-text-muted">
          Cole aqui o link de convite do seu grupo do WhatsApp. Deixe em branco
          para ocultar a seção da área de membros.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
          <CheckCircle2 size={16} />
          Link salvo com sucesso!
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
