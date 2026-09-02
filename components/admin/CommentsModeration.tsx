"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Trash2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  lesson_id: string;
  author_auth_id: string;
  author_name: string;
  author_role: "student" | "admin";
  content: string;
  parent_id: string | null;
  is_hidden: boolean;
  created_at: string;
}

interface CommentsModerationProps {
  lessonId: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
}

export function CommentsModeration({ lessonId }: CommentsModerationProps) {
  const supabase = getSupabaseBrowserClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson-comments?lesson_id=${lessonId}`);
      const data = await res.json();
      if (res.ok) setComments(data.comments || []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAction(commentId: string, action: "hide" | "show" | "delete") {
    setActionId(commentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let res: Response;
      if (action === "delete") {
        if (!confirm("Apagar permanentemente?")) {
          setActionId(null);
          return;
        }
        res = await fetch(`/api/lesson-comments/${commentId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } else {
        res = await fetch(`/api/lesson-comments/${commentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ is_hidden: action === "hide" }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro.");
      }

      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro.");
    } finally {
      setActionId(null);
    }
  }

  const filtered = comments.filter((c) => {
    if (filter === "visible") return !c.is_hidden;
    if (filter === "hidden") return c.is_hidden;
    return true;
  });

  const visibleCount = comments.filter((c) => !c.is_hidden).length;
  const hiddenCount = comments.filter((c) => c.is_hidden).length;

  return (
    <div className="rounded-2xl border border-border bg-bg-card/50 p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-accent" />
          <h3 className="font-display text-lg font-bold text-text-primary">
            Moderação de comentários
          </h3>
        </div>
        <span className="text-xs text-text-muted">
          {visibleCount} visíveis · {hiddenCount} ocultos
        </span>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        {(["all", "visible", "hidden"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-accent text-white"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary"
            )}
          >
            {f === "all" ? "Todos" : f === "visible" ? "Visíveis" : "Ocultos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-elevated/30 p-6 text-center text-sm text-text-muted">
          Nenhum comentário {filter !== "all" && `(${filter === "visible" ? "visível" : "oculto"})`}.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded-xl border border-border bg-bg-elevated/40 p-3",
                c.is_hidden && "border-red-500/40 bg-red-500/5"
              )}
            >
              <div className="flex gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    c.author_role === "admin" ? "bg-accent-gradient" : "bg-bg-elevated"
                  )}
                >
                  {c.author_role === "admin" ? <ShieldCheck size={14} /> : getInitials(c.author_name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {c.author_name}
                    </span>
                    {c.author_role === "admin" && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        Suporte
                      </span>
                    )}
                    {c.parent_id && (
                      <span className="text-[10px] text-text-muted">
                        ↳ resposta
                      </span>
                    )}
                    <span className="text-xs text-text-muted">
                      {timeAgo(c.created_at)}
                    </span>
                    {c.is_hidden && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                        Oculto
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
                    {c.content}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAction(c.id, c.is_hidden ? "show" : "hide")}
                      disabled={actionId === c.id}
                      className="inline-flex items-center gap-1 rounded-md bg-bg-elevated px-2 py-1 text-text-muted transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
                    >
                      {c.is_hidden ? (
                        <>
                          <Eye size={11} />
                          Mostrar
                        </>
                      ) : (
                        <>
                          <EyeOff size={11} />
                          Ocultar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(c.id, "delete")}
                      disabled={actionId === c.id}
                      className="inline-flex items-center gap-1 rounded-md bg-bg-elevated px-2 py-1 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    >
                      {actionId === c.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Trash2 size={11} />
                      )}
                      Apagar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}