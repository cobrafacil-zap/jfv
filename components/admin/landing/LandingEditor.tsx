"use client";

import { useState, useMemo } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type {
  LandingContent,
  LandingSectionKey,
} from "@/lib/landing-content";
import {
  NavForm,
  HeroForm,
  StatsForm,
  SobreForm,
  QualquerUmForm,
  ProdutosForm,
  MetodoForm,
  ResultadosForm,
  FaqForm,
  CtaForm,
  FooterForm,
} from "./sections";

const TABS: { key: LandingSectionKey; label: string }[] = [
  { key: "nav", label: "Menu" },
  { key: "hero", label: "Hero" },
  { key: "stats", label: "Estatísticas" },
  { key: "sobre", label: "Sobre" },
  { key: "qualquer_um", label: "Qualquer um" },
  { key: "produtos", label: "Produtos" },
  { key: "metodo", label: "Método JFV" },
  { key: "resultados", label: "Resultados" },
  { key: "faq", label: "FAQ" },
  { key: "cta", label: "CTA final" },
  { key: "footer", label: "Rodapé" },
];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function LandingEditor({ initial }: { initial: LandingContent }) {
  const [content, setContent] = useState<LandingContent>(() => clone(initial));
  const [active, setActive] = useState<LandingSectionKey>("hero");
  const [dirty, setDirty] = useState<Set<LandingSectionKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    { kind: "ok" | "err"; msg: string } | null
  >(null);

  function update<K extends LandingSectionKey>(
    key: K,
    next: LandingContent[K]
  ) {
    setContent((prev) => ({ ...prev, [key]: next }));
    setDirty((prev) => new Set(prev).add(key));
    setStatus(null);
  }

  const activeDirty = dirty.has(active);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: active, content: content[active] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao salvar.");
      }
      setDirty((prev) => {
        const n = new Set(prev);
        n.delete(active);
        return n;
      });
      setStatus({ kind: "ok", msg: "Seção salva com sucesso." });
    } catch (e) {
      setStatus({
        kind: "err",
        msg: e instanceof Error ? e.message : "Erro ao salvar.",
      });
    } finally {
      setSaving(false);
    }
  }

  const Form = useMemo(() => {
    switch (active) {
      case "nav":
        return <NavForm value={content.nav} onChange={(v) => update("nav", v)} />;
      case "hero":
        return <HeroForm value={content.hero} onChange={(v) => update("hero", v)} />;
      case "stats":
        return <StatsForm value={content.stats} onChange={(v) => update("stats", v)} />;
      case "sobre":
        return <SobreForm value={content.sobre} onChange={(v) => update("sobre", v)} />;
      case "qualquer_um":
        return <QualquerUmForm value={content.qualquer_um} onChange={(v) => update("qualquer_um", v)} />;
      case "produtos":
        return <ProdutosForm value={content.produtos} onChange={(v) => update("produtos", v)} />;
      case "metodo":
        return <MetodoForm value={content.metodo} onChange={(v) => update("metodo", v)} />;
      case "resultados":
        return <ResultadosForm value={content.resultados} onChange={(v) => update("resultados", v)} />;
      case "faq":
        return <FaqForm value={content.faq} onChange={(v) => update("faq", v)} />;
      case "cta":
        return <CtaForm value={content.cta} onChange={(v) => update("cta", v)} />;
      case "footer":
        return <FooterForm value={content.footer} onChange={(v) => update("footer", v)} />;
    }
  }, [active, content]);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-muted">Site público</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
            Conteúdo do site
          </h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Edite cada seção da landing page — textos, fotos, links e botões.
            As alterações aparecem no site público ao salvar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span
              className={`flex items-center gap-1.5 text-sm ${
                status.kind === "ok" ? "text-green-400" : "text-red-400"
              }`}
            >
              {status.kind === "ok" ? <Check size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving || !activeDirty}
            className="flex items-center gap-2 rounded-lg bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-opacity disabled:opacity-40"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Salvar seção
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tabs */}
        <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {TABS.map((t) => {
            const isActive = t.key === active;
            const isDirty = dirty.has(t.key);
            return (
              <button
                key={t.key}
                onClick={() => {
                  setActive(t.key);
                  setStatus(null);
                }}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <span>{t.label}</span>
                {isDirty && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" title="Não salvo" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Form */}
        <div className="min-w-0 flex-1">{Form}</div>
      </div>
    </div>
  );
}