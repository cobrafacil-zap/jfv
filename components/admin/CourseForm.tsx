"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";

interface CourseFormProps {
  initial?: {
    id: string;
    title: string;
    description: string;
    short_description: string;
    cover_image_url: string;
    order_index: number;
    is_published: boolean;
  };
}

export function CourseForm({ initial }: CourseFormProps) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title || "");
  const [shortDescription, setShortDescription] = useState(
    initial?.short_description || ""
  );
  const [description, setDescription] = useState(initial?.description || "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.cover_image_url || ""
  );
  const [orderIndex, setOrderIndex] = useState(initial?.order_index ?? 0);
  const [isPublished, setIsPublished] = useState(
    initial?.is_published || false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      short_description: shortDescription,
      description,
      cover_image_url: coverImageUrl,
      order_index: orderIndex,
      is_published: isPublished,
    };

    try {
      const url = isEdit ? `/api/admin/modules/${initial!.id}` : "/api/admin/modules";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao salvar.");
      }
      const data = await res.json();
      router.push(isEdit ? `/admin/modulos/${initial!.id}` : `/admin/modulos/${data.course.id}`);
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
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Título do módulo *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
          placeholder="Ex: Módulo 1 — Gravando com o celular"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Descrição curta
        </label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={280}
          className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
          placeholder="Resumo de uma linha"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Descrição completa
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:shadow-accent-glow-sm"
          placeholder="Sobre o que é este módulo..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Capa do módulo
          </label>
          <ImageUploader
            uploadType="image"
            value={coverImageUrl || null}
            onChange={(data) => setCoverImageUrl(data?.url || "")}
            aspect="16/9"
            label="Clique ou arraste a capa"
            hint="JPG, PNG ou WebP até 5 MB"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Ordem
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
            />
            <p className="mt-1 text-xs text-text-muted">
              Posição na lista de módulos.
            </p>
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-elevated text-accent focus:ring-accent"
        />
        <span className="text-sm text-text-secondary">
          Publicar e mostrar para os alunos
        </span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Link
          href="/admin/modulos"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          Cancelar
        </Link>
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
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar módulo"}
        </button>
      </div>
    </form>
  );
}