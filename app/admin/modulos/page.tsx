import Link from "next/link";
import { Plus, Pencil, Trash2, BookOpen, Eye, EyeOff } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { ModuleActions } from "@/components/admin/ModuleActions";

export const dynamic = "force-dynamic";

export default async function ModulosPage() {
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("*, lessons(id, is_published)")
    .order("order_index");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Conteúdo</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
            Módulos
          </h1>
          <p className="mt-2 text-text-secondary">
            Organize os módulos do curso e suas aulas.
          </p>
        </div>
        <Link
          href="/admin/modulos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110"
        >
          <Plus size={16} />
          Novo módulo
        </Link>
      </div>

      {(!courses || courses.length === 0) ? (
        <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">
            Nenhum módulo criado ainda.
          </p>
          <Link
            href="/admin/modulos/novo"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={14} />
            Criar primeiro módulo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, i) => {
            const lessonsCount = course.lessons?.length || 0;
            const publishedLessons =
              course.lessons?.filter((l: any) => l.is_published).length || 0;
            return (
              <div
                key={course.id}
                className="rounded-2xl border border-border bg-bg-card/50 p-5 transition-all hover:border-accent/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-gradient font-display text-base font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg font-bold text-text-primary">
                        {course.title}
                      </h3>
                      {course.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                          <Eye size={10} />
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase text-text-muted">
                          <EyeOff size={10} />
                          Rascunho
                        </span>
                      )}
                    </div>
                    {course.short_description && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {course.short_description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-text-muted">
                      {publishedLessons} de {lessonsCount} aulas publicadas
                    </div>
                  </div>

                  <ModuleActions moduleId={course.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}