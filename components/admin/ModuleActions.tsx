"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";

interface Props {
  moduleId: string;
}

export function ModuleActions({ moduleId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Tem certeza? Isso remove o módulo e todas as aulas.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch (err) {
      alert("Erro ao deletar módulo.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={`/admin/modulos/${moduleId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent"
      >
        <Pencil size={12} />
        Editar
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
      >
        {deleting ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Trash2 size={12} />
        )}
        Excluir
      </button>
    </div>
  );
}
