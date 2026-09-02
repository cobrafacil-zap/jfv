"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, Upload, X, ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** URL atual do arquivo (pra mostrar preview quando já tem) */
  value?: string | null;
  /** Path no Storage (pra permitir remoção depois) */
  path?: string | null;
  /** Chamado quando o upload completa */
  onChange: (data: { url: string; path: string; size: number } | null) => void;
  /** Tipo de upload (mapeia pro bucket no /api/admin/upload) */
  uploadType?: "image" | "video" | "bonus";
  /** MIME types aceitos */
  accept?: string;
  /** Tamanho máximo em bytes */
  maxSize?: number;
  /** Aspect ratio (ex: "16/9", "1/1") */
  aspect?: string;
  /** Placeholder */
  label?: string;
  /** Helper text embaixo */
  hint?: string;
  /** Desabilitar */
  disabled?: boolean;
  /** Classe extra */
  className?: string;
}

const DEFAULT_MAX: Record<string, number> = {
  image: 5 * 1024 * 1024,     // 5 MB
  video: 1024 * 1024 * 1024,  // 1 GB
  bonus: 100 * 1024 * 1024,   // 100 MB
};

const DEFAULT_ACCEPT: Record<string, string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/quicktime,video/webm",
  bonus: "application/pdf,application/zip,application/x-zip-compressed",
};

export function ImageUploader({
  value,
  path,
  onChange,
  uploadType = "image",
  accept,
  maxSize,
  aspect = "16/9",
  label = "Clique ou arraste um arquivo",
  hint,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptAttr = accept || DEFAULT_ACCEPT[uploadType];
  const maxSizeBytes = maxSize || DEFAULT_MAX[uploadType];
  const isImage = uploadType === "image";

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > maxSizeBytes) {
        const mb = Math.round(maxSizeBytes / (1024 * 1024));
        setError(`Arquivo maior que ${mb} MB.`);
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("type", uploadType);

        const result = await new Promise<{ url: string; path: string }>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/admin/upload");
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch {
                  reject(new Error("Resposta inválida do servidor."));
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

        onChange({
          url: result.url,
          path: result.path,
          size: file.size,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro no upload.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [maxSizeBytes, uploadType, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [disabled, uploading, uploadFile]
  );

  const handleRemove = useCallback(() => {
    if (disabled) return;
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [disabled, onChange]);

  // Preview
  if (value) {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          className="group relative overflow-hidden rounded-xl border border-border bg-bg-elevated"
          style={{ aspectRatio: aspect }}
        >
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 bg-bg-elevated text-text-secondary">
              <FileText size={32} />
              <span className="text-sm font-medium">Arquivo carregado</span>
            </div>
          )}

          {/* Overlay com ações */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-50"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-red-500 disabled:opacity-50"
            >
              Remover
            </button>
          </div>
        </div>

        {path && (
          <p className="truncate text-xs text-text-muted" title={path}>
            📎 {path.split("/").pop()}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
          }}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  // Empty state (drop zone)
  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-bg-elevated/40 p-6 text-center transition-all",
          dragging
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent",
          (disabled || uploading) && "cursor-not-allowed opacity-50"
        )}
        style={{ aspectRatio: aspect }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={28} className="animate-spin text-accent" />
            <p className="text-sm font-medium text-text-primary">
              Enviando... {progress}%
            </p>
            <div className="mt-1 h-1 w-48 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full bg-accent-gradient transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            {isImage ? (
              <ImageIcon size={28} className="text-accent" />
            ) : (
              <Upload size={28} className="text-accent" />
            )}
            <p className="text-sm font-semibold text-text-primary">{label}</p>
            {hint && <p className="text-xs text-text-muted">{hint}</p>}
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          <X size={14} />
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadFile(f);
        }}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}