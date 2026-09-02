import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle2, FileText, ExternalLink, Download } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentStudent } from "@/lib/auth";
import { VideoPlayer } from "@/components/membros/VideoPlayer";
import { CommentsSection } from "@/components/membros/CommentsSection";

export const dynamic = "force-dynamic";

export default async function AulaPage({
  params,
}: {
  params: { moduleId: string; lessonId: string };
}) {
  const student = await getCurrentStudent();
  if (!student) return null;

  // Buscar aula
  const { data: lesson } = await supabaseAdmin
    .from("lessons")
    .select("*, course:courses(id, title, order_index)")
    .eq("id", params.lessonId)
    .eq("is_published", true)
    .single();

  if (!lesson) notFound();

  // Materiais da aula
  const { data: materials } = await supabaseAdmin
    .from("lesson_materials")
    .select("*")
    .eq("lesson_id", params.lessonId)
    .order("order_index");

  // Próxima aula
  const { data: nextLesson } = await supabaseAdmin
    .from("lessons")
    .select("id, title, course_id")
    .eq("course_id", params.moduleId)
    .eq("is_published", true)
    .gt("order_index", lesson.order_index)
    .order("order_index")
    .limit(1)
    .maybeSingle();

  // Progresso
  const { data: progress } = await supabaseAdmin
    .from("student_progress")
    .select("watched, watched_at")
    .eq("student_id", student.id)
    .eq("lesson_id", params.lessonId)
    .maybeSingle();

  return (
    <div className="p-6 md:p-10">
      <Link
        href={`/membros/curso/${params.moduleId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para o módulo
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Player + info */}
        <div className="lg:col-span-2">
          <VideoPlayer lessonId={params.lessonId} />

          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
              <span>{lesson.course?.title}</span>
              {progress?.watched && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-accent">
                    <CheckCircle2 size={12} />
                    Concluída
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
              {lesson.title}
            </h1>
            {lesson.description && (
              <div className="mt-4 rounded-xl border border-border bg-bg-card/50 p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
                  Sobre esta aula
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {lesson.description}
                </p>
              </div>
            )}
          </div>

          {/* Comentários (embaixo do vídeo) */}
          <div className="mt-6">
            <CommentsSection lessonId={params.lessonId} />
          </div>
        </div>

        {/* Sidebar: materiais + próxima aula */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Materiais bônus */}
            {materials && materials.length > 0 && (
              <div className="rounded-2xl border border-border bg-bg-card/50 p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
                  📎 Materiais da aula
                </h3>
                <ul className="space-y-2">
                  {materials.map((m) => (
                    <li key={m.id}>
                      <a
                        href={m.type === "link" ? m.file_url! : m.file_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2.5 rounded-lg border border-border bg-bg-elevated/40 p-3 transition-all hover:border-accent hover:bg-accent/5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          {m.type === "file" ? (
                            <FileText size={14} />
                          ) : (
                            <ExternalLink size={14} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary group-hover:text-accent">
                            {m.title}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-text-muted">
                            {m.type === "file" ? "Baixar arquivo" : "Abrir link"}
                          </p>
                        </div>
                        {m.type === "file" && (
                          <Download size={14} className="shrink-0 text-text-muted group-hover:text-accent" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Próxima aula */}
            <div className="rounded-2xl border border-border bg-bg-card/50 p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
                Continue assistindo
              </h3>

              {nextLesson ? (
                <Link
                  href={`/membros/curso/${nextLesson.course_id}/aula/${nextLesson.id}`}
                  className="group block rounded-xl border border-border bg-bg-card p-4 transition-all hover:border-accent hover:shadow-accent-glow-sm"
                >
                  <p className="text-xs text-text-muted">Próxima aula</p>
                  <p className="mt-1 font-semibold text-text-primary group-hover:text-accent">
                    {nextLesson.title}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    Assistir
                    <ChevronRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-semibold">
                      Parabéns! Você concluiu este módulo.
                    </p>
                  </div>
                  <Link
                    href="/membros"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-text-secondary hover:text-accent"
                  >
                    Ver outros módulos →
                  </Link>
                </div>
              )}

              <div className="mt-5 border-t border-border pt-5">
                <Link
                  href={`/membros/curso/${params.moduleId}`}
                  className="block text-center text-sm text-text-secondary transition-colors hover:text-accent"
                >
                  Ver todas as aulas do módulo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}