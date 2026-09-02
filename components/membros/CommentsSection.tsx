"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, MessageSquare, Trash2, Reply, ShieldCheck } from "lucide-react";
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

interface CommentsSectionProps {
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

export function CommentsSection({ lessonId }: CommentsSectionProps) {
  const supabase = getSupabaseBrowserClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega usuário atual e role
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Verifica se é admin
        const { data: admin } = await supabase
          .from("admin_users")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        setIsAdmin(!!admin);
      }
    };
    init();
  }, [supabase]);

  // Carrega comentários
  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson-comments?lesson_id=${lessonId}`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Você precisa estar logado para comentar.");
        return;
      }

      const res = await fetch("/api/lesson-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          content: content.trim(),
          parent_id: replyTo || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao comentar.");
      }

      setContent("");
      setReplyTo(null);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao comentar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Apagar este comentário?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/lesson-comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao apagar.");
      }

      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao apagar.");
    }
  }

  async function toggleHide(commentId: string, currentHidden: boolean) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/lesson-comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_hidden: !currentHidden }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro.");
      }

      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro.");
    }
  }

  // Agrupa comentários top-level + respostas
  const topLevel = comments.filter((c) => !c.parent_id && !c.is_hidden);
  const repliesByParent = new Map<string, Comment[]>();
  comments
    .filter((c) => c.parent_id && !c.is_hidden)
    .forEach((c) => {
      const list = repliesByParent.get(c.parent_id!) || [];
      list.push(c);
      repliesByParent.set(c.parent_id!, list);
    });

  return (
    <div className="rounded-2xl border border-border bg-bg-card/50 p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-accent" />
        <h3 className="font-display text-lg font-bold text-text-primary">
          Comentários
        </h3>
        <span className="text-xs text-text-muted">
          ({topLevel.length})
        </span>
      </div>

      {/* Form de novo comentário */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-6">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
              <Reply size={12} />
              Respondendo a um comentário
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-auto text-text-muted hover:text-text-primary"
              >
                cancelar
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? "Sua resposta..." : "Deixe sua dúvida ou comentário..."}
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
          />
          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-text-muted">{content.length}/2000</p>
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Enviar
            </button>
          </div>
        </form>
      )}

      {!currentUserId && (
        <div className="mb-6 rounded-lg border border-border bg-bg-elevated/40 p-3 text-center text-xs text-text-muted">
          Faça login para deixar um comentário.
        </div>
      )}

      {/* Lista de comentários */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : topLevel.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-elevated/30 p-6 text-center">
          <p className="text-sm text-text-muted">
            Nenhum comentário ainda. Seja a primeira a perguntar!
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {topLevel.map((c) => (
            <li key={c.id}>
              <CommentItem
                comment={c}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onReply={() => {
                  setReplyTo(c.id);
                  // scroll pro form
                  document.querySelector("textarea")?.focus();
                }}
                onDelete={() => handleDelete(c.id)}
                onToggleHide={() => toggleHide(c.id, c.is_hidden)}
              />
              {/* Respostas */}
              {repliesByParent.get(c.id)?.map((reply) => (
                <div key={reply.id} className="ml-6 mt-3 md:ml-10">
                  <CommentItem
                    comment={reply}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onReply={() => {
                      setReplyTo(c.id);
                      document.querySelector("textarea")?.focus();
                    }}
                    onDelete={() => handleDelete(reply.id)}
                    onToggleHide={() => toggleHide(reply.id, reply.is_hidden)}
                    isReply
                  />
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      {/* Lista de comentários ocultos (só admin vê) */}
      {isAdmin && comments.some((c) => c.is_hidden) && (
        <details className="mt-6 rounded-lg border border-red-500/40 bg-red-500/5 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-red-400">
            ⚠️ {comments.filter((c) => c.is_hidden).length} comentário(s) oculto(s)
          </summary>
          <ul className="mt-3 space-y-3">
            {comments.filter((c) => c.is_hidden).map((c) => (
              <li key={c.id} className="opacity-70">
                <CommentItem
                  comment={c}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onReply={() => {}}
                  onDelete={() => handleDelete(c.id)}
                  onToggleHide={() => toggleHide(c.id, c.is_hidden)}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string | null;
  isAdmin: boolean;
  isReply?: boolean;
  onReply: () => void;
  onDelete: () => void;
  onToggleHide: () => void;
}

function CommentItem({ comment, currentUserId, isAdmin, isReply, onReply, onDelete, onToggleHide }: CommentItemProps) {
  const isOwner = comment.author_auth_id === currentUserId;
  const isAdminComment = comment.author_role === "admin";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-border bg-bg-elevated/40 p-3",
        isReply && "border-l-2 border-l-accent/40"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
          isAdminComment ? "bg-accent-gradient shadow-accent-glow-sm" : "bg-bg-elevated"
        )}
      >
        {isAdminComment ? <ShieldCheck size={14} /> : getInitials(comment.author_name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">
            {comment.author_name}
          </span>
          {isAdminComment && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Suporte
            </span>
          )}
          <span className="text-xs text-text-muted">
            {timeAgo(comment.created_at)}
          </span>
        </div>

        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
          {comment.content}
        </p>

        <div className="mt-2 flex items-center gap-3 text-xs">
          {!isReply && currentUserId && !comment.is_hidden && (
            <button
              type="button"
              onClick={onReply}
              className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-accent"
            >
              <Reply size={11} />
              Responder
            </button>
          )}
          {(isOwner || isAdmin) && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-red-400"
            >
              <Trash2 size={11} />
              Apagar
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={onToggleHide}
              className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-amber-400"
            >
              {comment.is_hidden ? "Mostrar" : "Ocultar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}