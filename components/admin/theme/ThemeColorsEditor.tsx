"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import {
  buildThemeCss,
  DEFAULT_THEME_COLORS,
  THEME_PRESETS,
  type ThemeColors,
} from "@/lib/theme-colors";

function isSame(a: ThemeColors, b: ThemeColors) {
  return (
    a.primary.toLowerCase() === b.primary.toLowerCase() &&
    a.secondary.toLowerCase() === b.secondary.toLowerCase()
  );
}

export function ThemeColorsEditor({ initial }: { initial: ThemeColors }) {
  const [colors, setColors] = useState<ThemeColors>(initial);
  const [saved, setSaved] = useState<ThemeColors>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Aplica as cores ao vivo (override global das CSS vars) para preview.
  const applyLive = useCallback((c: ThemeColors) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById("theme-vars");
    if (el) el.textContent = buildThemeCss(c);
  }, []);

  useEffect(() => {
    applyLive(colors);
  }, [colors, applyLive]);

  const dirty = !isSame(colors, saved);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(colors),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setSaved(colors);
      setStatus({ ok: true, msg: "Cores salvas! O site já está com a nova paleta." });
    } catch {
      setStatus({ ok: false, msg: "Erro ao salvar as cores." });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setColors(DEFAULT_THEME_COLORS);
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-muted">Site público</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
            Aparência
          </h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Escolha as cores do site. A mudança se aplica em tempo real a toda a
            landing, ao painel admin e à área de membros.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span
              className={`text-sm ${status.ok ? "text-green-400" : "text-red-400"}`}
            >
              {status.msg}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-2 rounded-lg bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-opacity disabled:opacity-40"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Salvar cores
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-6 rounded-2xl border border-border bg-bg-card/50 p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
          Paletas prontas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {THEME_PRESETS.map((p) => {
            const active = isSame(colors, p.colors);
            return (
              <button
                key={p.name}
                onClick={() => setColors(p.colors)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50 hover:bg-bg-elevated"
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${p.colors.primary}, ${p.colors.secondary})`,
                  }}
                />
                <span className="text-sm font-semibold text-text-primary">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seletores personalizados */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
            Cor personalizada
          </h2>
          <div className="space-y-5">
            <ColorField
              label="Cor principal"
              value={colors.primary}
              onChange={(primary) => setColors((c) => ({ ...c, primary }))}
            />
            <ColorField
              label="Cor secundária (gradiente/mesh)"
              value={colors.secondary}
              onChange={(secondary) => setColors((c) => ({ ...c, secondary }))}
            />
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:border-accent/50 hover:text-accent"
            >
              <RotateCcw size={14} />
              Voltar ao padrão (violeta)
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
            Pré-visualização
          </h2>
          <div className="space-y-4 rounded-xl border border-border bg-bg-elevated/40 p-5">
            <span className="inline-block rounded-full bg-accent-pale px-3 py-1 text-xs font-semibold text-accent">
              Eyebrow de exemplo
            </span>
            <h3 className="font-display text-2xl font-bold text-text-primary">
              Título da seção
            </h3>
            <p className="text-sm text-text-secondary">
              Texto de apoio da landing usando a nova paleta em modo claro e
              noturno.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-accent-gradient px-4 py-2 text-sm font-semibold text-white">
                Botão primário
              </span>
              <span className="rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary">
                Botão outline
              </span>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-accent-pale px-3 py-1 text-xs font-semibold text-accent">
                Tag
              </span>
              <span className="rounded-full bg-bg-card px-3 py-1 text-xs font-semibold text-accent">
                Badge
              </span>
            </div>
            <div
              className="h-3 w-full rounded-full"
              style={{
                background: `linear-gradient(90deg, var(--accent), var(--accent-light), var(--accent-2))`,
              }}
            />
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Dica: o preview usa as cores em tempo real. Use o botão de tema
            (sol/lua) para ver nos dois modos.
          </p>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-border bg-bg-elevated p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-medium text-text-primary focus:border-accent focus:outline-none"
        />
      </div>
    </label>
  );
}