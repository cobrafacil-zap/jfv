"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";

interface Props {
  lessonId: string;
}

export function LessonActions({ lessonId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir esta aula? O progresso dos alunos será removido.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch (err) {
      alert("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex shrink-0 gap-1">
      <Link
        href={`/admin/aulas/${lessonId}`}
        className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
        title="Editar"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-red-400 disabled:opacity-50"
        title="Excluir"
      >
        {deleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    </div>
  );
}
