import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { LessonForm } from "@/components/admin/LessonForm";
import { CommentsModeration } from "@/components/admin/CommentsModeration";

export const dynamic = "force-dynamic";

export default async function EditarAulaPage({
  params,
}: {
  params: { id: string };
}) {
  const [{ data: lesson }, { data: courses }, { count: commentsCount }] =
    await Promise.all([
      supabaseAdmin
        .from("lessons")
        .select("*")
        .eq("id", params.id)
        .single(),
      supabaseAdmin
        .from("courses")
        .select("id, title")
        .order("order_index"),
      supabaseAdmin
        .from("lesson_comments")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", params.id),
    ]);

  if (!lesson) notFound();

  return (
    <div className="p-6 md:p-10">
      <Link
        href={`/admin/modulos/${lesson.course_id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para o módulo
      </Link>

      <div className="mb-8">
        <p className="text-sm text-text-muted">Editando</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          {lesson.title}
        </h1>
        {commentsCount !== null && commentsCount > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            {commentsCount} comentário(s) ao todo
          </p>
        )}
      </div>

      <div className="space-y-6">
        <LessonForm
          courses={courses || []}
          initial={{
            id: lesson.id,
            course_id: lesson.course_id,
            title: lesson.title,
            description: lesson.description || "",
            video_url: lesson.video_url || "",
            video_path: lesson.video_path || "",
            duration_seconds: lesson.duration_seconds || 0,
            order_index: lesson.order_index,
            is_published: lesson.is_published,
            thumbnail_url: lesson.thumbnail_url || "",
            thumbnail_path: lesson.thumbnail_path || "",
          }}
        />

        <CommentsModeration lessonId={lesson.id} />
      </div>
    </div>
  );
}
