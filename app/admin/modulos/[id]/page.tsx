import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus, PlayCircle, MessageCircle, ImageIcon } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { CourseForm } from "@/components/admin/CourseForm";
import { LessonActions } from "@/components/admin/LessonActions";

export const dynamic = "force-dynamic";

export default async function EditarModuloPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabaseAdmin
    .from("lessons")
    .select("*, lesson_comments(count)")
    .eq("course_id", params.id)
    .order("order_index");

  const totalComments = lessons?.reduce((sum, l) => {
    const count = (l as any).lesson_comments?.[0]?.count || 0;
    return sum + count;
  }, 0) || 0;

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin/modulos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para módulos
      </Link>

      {/* Header com capa */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-bg-card">
        {course.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="h-40 w-full object-cover md:h-48"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-card md:h-48">
            <ImageIcon size={32} className="text-text-muted" />
          </div>
        )}
        <div className="p-5">
          <p className="text-xs uppercase tracking-wider text-text-muted">
            Editando módulo
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary md:text-3xl">
            {course.title}
          </h1>
          {course.short_description && (
            <p className="mt-1 text-sm text-text-secondary">
              {course.short_description}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
            Informações do módulo
          </h2>
          <CourseForm
            initial={{
              id: course.id,
              title: course.title,
              description: course.description || "",
              short_description: course.short_description || "",
              cover_image_url: course.cover_image_url || "",
              order_index: course.order_index,
              is_published: course.is_published,
            }}
          />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text-primary">
              Aulas ({lessons?.length || 0})
            </h2>
            <Link
              href={`/admin/aulas/nova?course_id=${course.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110"
            >
              <Plus size={14} />
              Nova aula
            </Link>
          </div>

          {(!lessons || lessons.length === 0) ? (
            <div className="rounded-2xl border border-border bg-bg-card/50 p-8 text-center">
              <PlayCircle size={28} className="mx-auto mb-2 text-text-muted" />
              <p className="text-sm text-text-muted">
                Nenhuma aula cadastrada.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {lessons.map((lesson, i) => (
                <li
                  key={lesson.id}
                  className="rounded-xl border border-border bg-bg-card/50 p-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail ou número */}
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg md:h-14 md:w-20">
                      {lesson.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lesson.thumbnail_url}
                          alt={lesson.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center text-xs font-bold ${
                            lesson.is_published
                              ? "bg-accent text-white"
                              : "bg-bg-elevated text-text-muted"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-text-primary">
                        {lesson.title}
                      </h4>
                      {lesson.description && (
                        <p className="truncate text-xs text-text-muted">
                          {lesson.description}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                        <span>
                          {lesson.duration_seconds
                            ? `${Math.floor(lesson.duration_seconds / 60)}:${String(lesson.duration_seconds % 60).padStart(2, "0")}`
                            : "—"}
                        </span>
                        <span>·</span>
                        <span>{lesson.is_published ? "publicado" : "rascunho"}</span>
                        {(lesson as any).lesson_comments?.[0]?.count > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5 text-accent">
                              <MessageCircle size={10} />
                              {(lesson as any).lesson_comments[0].count}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <LessonActions lessonId={lesson.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalComments > 0 && (
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-3 text-xs text-accent">
              💬 {totalComments} comentário(s) no total nestas aulas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}