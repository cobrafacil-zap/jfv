import Link from "next/link";
import { Plus, PlayCircle } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { LessonActions } from "@/components/admin/LessonActions";

export const dynamic = "force-dynamic";

export default async function AulasPage() {
  const { data: lessons } = await supabaseAdmin
    .from("lessons")
    .select("*, course:courses(id, title)")
    .order("order_index");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Conteúdo</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
            Aulas
          </h1>
          <p className="mt-2 text-text-secondary">
            {lessons?.length || 0} aulas cadastradas.
          </p>
        </div>
        <Link
          href="/admin/aulas/nova"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110"
        >
          <Plus size={16} />
          Nova aula
        </Link>
      </div>

      {(!lessons || lessons.length === 0) ? (
        <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
          <PlayCircle size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">Nenhuma aula criada ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-card/50">
          <ul className="divide-y divide-border">
            {lessons.map((lesson: any) => (
              <li
                key={lesson.id}
                className="grid items-center gap-3 p-4 transition-colors hover:bg-bg-elevated/40 md:grid-cols-[2fr_2fr_1fr_40px]"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-text-primary">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="truncate text-xs text-text-muted">
                      {lesson.description}
                    </p>
                  )}
                </div>
                <span className="truncate text-sm text-text-secondary">
                  {lesson.course?.title}
                </span>
                <span
                  className={`inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    lesson.is_published
                      ? "bg-accent/15 text-accent"
                      : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  {lesson.is_published ? "publicada" : "rascunho"}
                </span>
                <LessonActions lessonId={lesson.id} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
