import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { LessonForm } from "@/components/admin/LessonForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { course_id?: string };
}

export default async function NovaAulaPage({ searchParams }: PageProps) {
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("id, title")
    .order("order_index");

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin/aulas"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para aulas
      </Link>

      <div className="mb-8">
        <p className="text-sm text-text-muted">Conteúdo</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          Nova aula
        </h1>
      </div>

      {(!courses || courses.length === 0) ? (
        <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
          <p className="text-text-secondary">
            Você precisa criar um módulo antes de adicionar aulas.
          </p>
          <Link
            href="/admin/modulos/novo"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Criar módulo
          </Link>
        </div>
      ) : (
        <LessonForm courses={courses} initialCourseId={searchParams.course_id} />
      )}
    </div>
  );
}
