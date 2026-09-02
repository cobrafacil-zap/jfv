"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";

interface Props {
  bonusId: string;
}

export function BonusActions({ bonusId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este bônus?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bonuses/${bonusId}`, {
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
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/bonus/${bonusId}`}
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
      </button>
    </div>
  );
}
