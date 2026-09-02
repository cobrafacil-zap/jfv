import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  Clock,
  ChevronLeft,
  Lock,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentStudent } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function ModuloPage({
  params,
}: {
  params: { moduleId: string };
}) {
  const student = await getCurrentStudent();
  if (!student) return null;

  // Buscar módulo
  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("id", params.moduleId)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  // Buscar aulas
  const { data: lessons } = await supabaseAdmin
    .from("lessons")
    .select("*")
    .eq("course_id", params.moduleId)
    .eq("is_published", true)
    .order("order_index");

  // Buscar progresso do aluno nestas aulas
  const lessonIds = (lessons || []).map((l) => l.id);
  const { data: progress } = await supabaseAdmin
    .from("student_progress")
    .select("lesson_id, watched")
    .eq("student_id", student.id)
    .in("lesson_id", lessonIds);

  const progressMap = new Map(
    (progress || []).map((p) => [p.lesson_id, p.watched])
  );

  const totalLessons = lessons?.length || 0;
  const watchedLessons =
    lessons?.filter((l) => progressMap.get(l.id)).length || 0;
  const progressPercent =
    totalLessons > 0
      ? Math.round((watchedLessons / totalLessons) * 100)
      : 0;

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/membros"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para módulos
      </Link>

      {/* Header do módulo */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-card to-accent/10 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-gradient font-display text-xl font-bold text-white shadow-accent-glow">
            {String(course.order_index).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-2 text-text-secondary">{course.description}</p>
            )}

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {watchedLessons} de {totalLessons} aulas concluídas
                </span>
                <span className="font-semibold text-accent">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                <div
                  className="h-full rounded-full bg-accent-gradient transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de aulas */}
      <div className="space-y-3">
        {(lessons || []).map((lesson, i) => {
          const watched = progressMap.get(lesson.id);

          return (
            <Link
              key={lesson.id}
              href={`/membros/curso/${params.moduleId}/aula/${lesson.id}`}
              className="group flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-bg-card/50 transition-all hover:border-accent hover:bg-bg-card hover:shadow-accent-glow-sm md:gap-4 md:p-2"
            >
              {/* Thumbnail ou número */}
              <div
                className={`relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden md:h-20 md:w-32 ${
                  watched ? "" : "bg-bg-elevated"
                }`}
              >
                {lesson.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lesson.thumbnail_url}
                    alt={lesson.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center font-display text-lg font-bold md:text-xl ${
                      watched
                        ? "bg-accent-gradient text-white"
                        : "bg-bg-elevated text-text-secondary"
                    }`}
                  >
                    {watched ? <CheckCircle2 size={24} /> : String(i + 1).padStart(2, "0")}
                  </div>
                )}
                {watched && lesson.thumbnail_url && (
                  <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 py-3 pr-3 md:py-4 md:pr-4">
                <h3 className="truncate font-semibold text-text-primary md:text-base">
                  {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary md:text-sm">
                    {lesson.description}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(lesson.duration_seconds)}
                  </span>
                  {watched && (
                    <span className="text-accent">✓ Assistida</span>
                  )}
                </div>
              </div>

              {/* Play icon */}
              <div className="shrink-0 pr-3 text-text-secondary transition-all group-hover:text-accent md:pr-5">
                <PlayCircle size={28} />
              </div>
            </Link>
          );
        })}

        {totalLessons === 0 && (
          <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
            <p className="text-text-secondary">
              Nenhuma aula publicada ainda neste módulo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}