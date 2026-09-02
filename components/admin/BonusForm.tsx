"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Upload, X, Download } from "lucide-react";
import Link from "next/link";

interface BonusFormProps {
  initial?: {
    id: string;
    title: string;
    description: string;
    file_url: string;
    file_path: string;
    order_index: number;
    is_published: boolean;
  };
}

export function BonusForm({ initial }: BonusFormProps) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [fileUrl, setFileUrl] = useState(initial?.file_url || "");
  const [filePath, setFilePath] = useState(initial?.file_path || "");
  const [orderIndex, setOrderIndex] = useState(initial?.order_index ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.is_published || false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "bonus");
      form.append("folder", "bonus");

      const result = await new Promise<{ url: string; path: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/upload");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Resposta inválida."));
              }
            } else {
              try {
                const data = JSON.parse(xhr.responseText);
                reject(new Error(data.error || "Erro no upload."));
              } catch {
                reject(new Error("Erro no upload."));
              }
            }
          };
          xhr.onerror = () => reject(new Error("Erro de rede."));
          xhr.send(form);
        }
      );

      setFileUrl(result.url);
      setFilePath(result.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        file_url: fileUrl,
        file_path: filePath,
        order_index: orderIndex,
        is_published: isPublished,
      };
      const url = isEdit
        ? `/api/admin/bonuses/${initial!.id}`
        : "/api/admin/bonuses";
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
      router.push("/admin/bonus");
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
          Título *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          className="w-full resize-none rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Ordem
        </label>
        <input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
          min={0}
          className="w-full max-w-[160px] rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Arquivo
        </label>
        {!fileUrl ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.zip,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-bg-elevated/40 p-8 text-center transition-colors hover:border-accent disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-accent" />
                  <p className="text-sm text-text-secondary">
                    Enviando... {uploadProgress}%
                  </p>
                  <div className="mt-1 h-1 w-48 overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className="h-full bg-accent-gradient transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-accent" />
                  <p className="text-sm font-semibold text-text-primary">
                    Enviar arquivo do bônus
                  </p>
                  <p className="text-xs text-text-muted">
                    PDF, ZIP ou imagem até 100 MB
                  </p>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated/40 p-4">
            <Download size={18} className="shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {filePath || "arquivo"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFileUrl("");
                setFilePath("");
              }}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-red-400"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-elevated text-accent focus:ring-accent"
        />
        <span className="text-sm text-text-secondary">Publicar bônus</span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Link
          href="/admin/bonus"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar bônus"}
        </button>
      </div>
    </form>
  );
}
