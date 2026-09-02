"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Upload, X, FileText, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { MaterialEditor, type MaterialItem } from "./MaterialEditor";

interface LessonFormProps {
  courses: { id: string; title: string }[];
  initialCourseId?: string;
  initial?: {
    id: string;
    course_id: string;
    title: string;
    description: string;
    video_url: string;
    video_path: string;
    duration_seconds: number;
    order_index: number;
    is_published: boolean;
    thumbnail_url?: string | null;
    thumbnail_path?: string | null;
  };
}

function formatDuration(s: number) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function LessonForm({ courses, initialCourseId, initial }: LessonFormProps) {
  const router = useRouter();
  const defaultCourseId =
    initial?.course_id || initialCourseId || courses[0]?.id || "";
  const isEdit = !!initial;

  const [courseId, setCourseId] = useState(defaultCourseId);
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [videoUrl, setVideoUrl] = useState(initial?.video_url || "");
  const [videoPath, setVideoPath] = useState(initial?.video_path || "");
  const [durationSeconds, setDurationSeconds] = useState(
    initial?.duration_seconds || 0
  );
  const [orderIndex, setOrderIndex] = useState(initial?.order_index ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.is_published || false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url || "");
  const [thumbnailPath, setThumbnailPath] = useState(initial?.thumbnail_path || "");

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega materiais quando editando
  useEffect(() => {
    if (!initial?.id) return;
    setLoadingMaterials(true);
    fetch(`/api/admin/lessons/${initial.id}/materials`)
      .then((r) => r.json())
      .then((data) => {
        if (data.materials) setMaterials(data.materials);
      })
      .catch((err) => console.error("Erro ao carregar materiais:", err))
      .finally(() => setLoadingMaterials(false));
  }, [initial?.id]);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "video");
      form.append("folder", courseId);

      const url = "/api/admin/upload";
      const result = await new Promise<{ url: string; path: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url);
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

      setVideoUrl(result.url);
      setVideoPath(result.path);

      // Detecta duração
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.src = result.url;
      probe.onloadedmetadata = () => {
        if (isFinite(probe.duration)) {
          setDurationSeconds(Math.round(probe.duration));
        }
      };
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
        course_id: courseId,
        title,
        description,
        video_url: videoUrl,
        video_path: videoPath,
        duration_seconds: durationSeconds,
        order_index: orderIndex,
        is_published: isPublished,
        thumbnail_url: thumbnailUrl || null,
        thumbnail_path: thumbnailPath || null,
      };

      const url = isEdit
        ? `/api/admin/lessons/${initial!.id}`
        : "/api/admin/lessons";
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
      const lessonId = isEdit ? initial!.id : data.lesson.id;

      // Salva materiais (PUT substitui lista inteira)
      const matRes = await fetch(`/api/admin/lessons/${lessonId}/materials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials }),
      });
      if (!matRes.ok) {
        const matData = await matRes.json().catch(() => ({}));
        throw new Error(matData.error || "Erro ao salvar materiais.");
      }

      router.push(`/admin/modulos/${courseId}`);
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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Módulo *
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
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
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Título da aula *
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
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Thumbnail (capa da aula)
        </label>
        <ImageUploader
          uploadType="image"
          value={thumbnailUrl || null}
          path={thumbnailPath}
          onChange={(data) => {
            setThumbnailUrl(data?.url || "");
            setThumbnailPath(data?.path || "");
          }}
          aspect="16/9"
          label="Enviar thumbnail"
          hint="JPG, PNG ou WebP até 5 MB — aparece na lista de aulas"
        />
      </div>

      {/* Upload de vídeo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Vídeo
        </label>
        {!videoUrl ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
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
                    Clique para enviar o vídeo
                  </p>
                  <p className="text-xs text-text-muted">MP4, MOV ou WebM até 1 GB</p>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-bg-elevated/40 p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">
                  ✓ Vídeo carregado
                </p>
                <p className="truncate text-xs text-text-muted">
                  {videoPath || videoUrl.split("/").pop()}
                </p>
                {durationSeconds > 0 && (
                  <p className="text-xs text-text-muted">
                    Duração: {formatDuration(durationSeconds)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl("");
                  setVideoPath("");
                  setDurationSeconds(0);
                }}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-red-400"
                title="Remover"
              >
                <X size={16} />
              </button>
            </div>
            {videoUrl && (
              <video
                src={videoUrl}
                controls
                className="mt-3 aspect-video w-full rounded-lg bg-black"
              />
            )}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Duração (segundos)
        </label>
        <input
          type="number"
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
          min={0}
          className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent focus:shadow-accent-glow-sm"
        />
        <p className="mt-1 text-xs text-text-muted">
          Detectado automaticamente após o upload.
        </p>
      </div>

      {/* Materiais bônus */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Materiais bônus
        </label>
        <p className="mb-2 text-xs text-text-muted">
          PDFs, templates, links extras que o aluno recebe junto com a aula.
        </p>
        {loadingMaterials ? (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 size={14} className="animate-spin" />
            Carregando materiais...
          </div>
        ) : (
          <MaterialEditor materials={materials} onChange={setMaterials} />
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-elevated text-accent focus:ring-accent"
        />
        <span className="text-sm text-text-secondary">Publicar aula</span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Link
          href={courseId ? `/admin/modulos/${courseId}` : "/admin/aulas"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving || uploading || !videoUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar aula"}
        </button>
      </div>
    </form>
  );
}