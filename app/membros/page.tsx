import Link from "next/link";
import {
  PlayCircle,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Check,
  Loader2,
} from "lucide-react";

// Logo oficial do WhatsApp (branca para usar no botão verde)
function WhatsAppLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
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

export default async function MembrosHome() {
  const student = await getCurrentStudent();
  if (!student) return null;

  // Busca cursos publicados (LEFT JOIN nas aulas pra incluir módulos sem aulas ainda)
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select(`
      id,
      title,
      short_description,
      cover_image_url,
      order_index,
      lessons(id, is_published, duration_seconds)
    `)
    .eq("is_published", true)
    .order("order_index");

  // Busca última aula acessada
  const { data: lastProgress } = await supabaseAdmin
    .from("student_progress")
    .select(`
      watched_at,
      lesson:lessons!inner(
        id,
        title,
        course_id,
        duration_seconds,
        course:courses(title)
      )
    `)
    .eq("student_id", student.id)
    .order("watched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Calcula progresso por módulo
  const modulesWithProgress = await Promise.all(
    (courses || []).map(async (course) => {
      const publishedLessons = (course.lessons || []).filter(
        (l: any) => l.is_published
      );
      const lessonIds = publishedLessons.map((l: any) => l.id);

      const { data: watchedLessons } = await supabaseAdmin
        .from("student_progress")
        .select("lesson_id")
        .eq("student_id", student.id)
        .in("lesson_id", lessonIds)
        .eq("watched", true);

      const totalLessons = publishedLessons.length;
      const watchedCount = watchedLessons?.length || 0;
      const progress =
        totalLessons > 0
          ? Math.round((watchedCount / totalLessons) * 100)
          : 0;

      return {
        id: course.id,
        title: course.title,
        short_description: course.short_description,
        cover_image_url: course.cover_image_url,
        totalLessons,
        watchedCount,
        progress,
      };
    })
  );

  const lastLesson = lastProgress?.lesson as any;

  // Link da comunidade (WhatsApp) configurado pelo admin
  const { data: communitySettings } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "community_whatsapp_url")
    .maybeSingle();
  const whatsappUrl = communitySettings?.value || "";

  return (
    <div className="p-6 md:p-10">
      {/* Welcome */}
      <div className="mb-10">
        <p className="text-sm text-text-muted">
          Bem-vinda de volta,
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          {student.full_name.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-text-secondary">
          Continue sua jornada de aprendizado.
        </p>
      </div>

      {/* Continue watching */}
      {lastLesson && (
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            <h2 className="font-display text-lg font-bold text-text-primary">
              Continue assistindo
            </h2>
          </div>
          <Link
            href={`/membros/curso/${lastLesson.course_id}/aula/${lastLesson.id}`}
            className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-card to-accent/10 p-5 transition-all hover:border-accent hover:shadow-accent-glow-sm"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-accent-gradient shadow-accent-glow-sm transition-transform group-hover:scale-110">
              <PlayCircle size={28} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-accent">
                {lastLesson.course?.title}
              </p>
              <p className="mt-1 truncate font-semibold text-text-primary">
                {lastLesson.title}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {formatDuration(lastLesson.duration_seconds)}
              </p>
            </div>
            <ChevronRight
              size={20}
              className="text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-accent"
            />
          </Link>
        </div>
      )}

      {/* Modules */}
      <div className="mb-6 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <h2 className="font-display text-lg font-bold text-text-primary">
          Módulos do curso
        </h2>
      </div>

      {modulesWithProgress.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
          <p className="text-text-secondary">
            Em breve novos módulos estarão disponíveis.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modulesWithProgress.map((module, i) => (
            <Link
              key={module.id}
              href={`/membros/curso/${module.id}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card transition-all hover:-translate-y-1 hover:border-accent hover:shadow-accent-glow-sm"
            >
              {/* Cover image / gradient */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-accent/30 to-bg-card">
                {module.cover_image_url ? (
                  <img
                    src={module.cover_image_url}
                    alt={module.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-4xl font-bold text-accent/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-text-primary">
                  {module.title}
                </h3>
                {module.short_description && (
                  <p className="mt-1 text-sm text-text-secondary">
                    {module.short_description}
                  </p>
                )}

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {module.watchedCount} de {module.totalLessons} aulas
                    </span>
                    <span className="font-semibold text-accent">
                      {module.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className="h-full rounded-full bg-accent-gradient transition-all"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Comunidade Gratuita (WhatsApp) */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-card to-accent/10 p-6 shadow-accent-glow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-gradient shadow-accent-glow-sm">
            <MessageCircle size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Bônus exclusivo
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-text-primary">
              Comunidade Gratuita
            </h2>
            <p className="mt-1 text-text-secondary">
              Entre no nosso grupo do WhatsApp e conecte-se com outros alunos.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-accent" />
                Networking com outros alunos
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-accent" />
                Tire dúvidas em tempo real
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="shrink-0 text-accent" />
                Lives e conteúdos exclusivos
              </li>
            </ul>
          </div>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-5px_rgba(37,211,102,0.5)] transition-all hover:brightness-110"
            >
              <WhatsAppLogo className="h-5 w-5" />
              Entrar no grupo
            </a>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-6 py-3 text-sm font-semibold text-text-muted">
              <Loader2 size={18} className="animate-spin" />
              Em breve
            </span>
          )}
        </div>
      </section>
    </div>
  );
}