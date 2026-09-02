"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, FileText, Link2, ExternalLink, X } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

export interface MaterialItem {
  id?: string;
  title: string;
  type: "file" | "link";
  file_path?: string | null;
  file_url?: string | null;
  file_size?: number | null;
}

interface MaterialEditorProps {
  materials: MaterialItem[];
  onChange: (materials: MaterialItem[]) => void;
  disabled?: boolean;
}

export function MaterialEditor({ materials, onChange, disabled }: MaterialEditorProps) {
  const [addingType, setAddingType] = useState<"file" | "link" | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function addMaterial(type: "file" | "link") {
    setAddingType(type);
    setNewTitle("");
    setNewUrl("");
  }

  function commitFile(data: { url: string; path: string; size: number } | null) {
    if (!data || !newTitle.trim()) {
      setAddingType(null);
      return;
    }
    onChange([
      ...materials,
      {
        title: newTitle.trim(),
        type: "file",
        file_path: data.path,
        file_url: data.url,
        file_size: data.size,
      },
    ]);
    setAddingType(null);
    setNewTitle("");
  }

  function commitLink() {
    if (!newTitle.trim() || !newUrl.trim()) {
      setAddingType(null);
      return;
    }
    // Validação simples de URL
    try {
      new URL(newUrl.trim());
    } catch {
      alert("URL inválida. Use http:// ou https://");
      return;
    }
    onChange([
      ...materials,
      {
        title: newTitle.trim(),
        type: "link",
        file_url: newUrl.trim(),
      },
    ]);
    setAddingType(null);
    setNewTitle("");
    setNewUrl("");
  }

  function removeMaterial(index: number) {
    onChange(materials.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= materials.length) return;
    const copy = [...materials];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      {/* Lista de materiais */}
      {materials.length === 0 && !addingType && (
        <div className="rounded-lg border border-dashed border-border bg-bg-elevated/30 p-4 text-center">
          <p className="text-xs text-text-muted">
            Nenhum material adicionado. Use os botões abaixo.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {materials.map((m, i) => (
          <li
            key={m.id || `${m.title}-${i}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/40 p-3"
          >
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={disabled || i === 0}
                className="rounded p-0.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30"
                title="Mover pra cima"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={disabled || i === materials.length - 1}
                className="rounded p-0.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30"
                title="Mover pra baixo"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              {m.type === "file" ? <FileText size={14} /> : <Link2 size={14} />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {m.title}
              </p>
              <p className="truncate text-xs text-text-muted">
                {m.type === "file"
                  ? m.file_path?.split("/").pop() || "arquivo"
                  : m.file_url}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeMaterial(i)}
              disabled={disabled}
              className="rounded p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              title="Remover"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      {/* Adicionar novo material */}
      {addingType ? (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-accent">
              {addingType === "file" ? "📁 Novo arquivo" : "🔗 Novo link"}
            </p>
            <button
              type="button"
              onClick={() => setAddingType(null)}
              className="rounded p-1 text-text-muted hover:bg-bg-elevated"
            >
              <X size={12} />
            </button>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título (ex: Checklist de gravação)"
            className="mb-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
            autoFocus
          />

          {addingType === "file" ? (
            <ImageUploader
              uploadType="bonus"
              accept="application/pdf,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint="PDF, ZIP, DOC até 100 MB"
              aspect="auto"
              label="Enviar arquivo"
              onChange={(data) => {
                if (data) {
                  setNewTitle((t) => t || data.path.split("/").pop() || "Arquivo");
                  commitFile(data);
                }
              }}
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://exemplo.com/material"
                className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
              />
              <button
                type="button"
                onClick={commitLink}
                disabled={!newTitle.trim() || !newUrl.trim()}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addMaterial("file")}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-bg-elevated/40 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <FileText size={14} />
            Arquivo
          </button>
          <button
            type="button"
            onClick={() => addMaterial("link")}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-bg-elevated/40 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <ExternalLink size={14} />
            Link externo
          </button>
        </div>
      )}
    </div>
  );
}