import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { StudentStatusForm } from "@/components/admin/StudentStatusForm";

export const dynamic = "force-dynamic";

function formatCurrency(value: number | null) {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function AlunoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: student } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!student) notFound();

  const [{ data: payments }, { data: progress }, { data: lessons }, { data: courses }] =
    await Promise.all([
      supabaseAdmin
        .from("payments")
        .select("*")
        .eq("student_id", params.id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("student_progress")
        .select("lesson_id, watched, watched_at")
        .eq("student_id", params.id),
      supabaseAdmin
        .from("lessons")
        .select("id, title, course_id, courses(title)"),
      supabaseAdmin
        .from("courses")
        .select("id, title, lessons(id)"),
    ]);

  const watchedIds = new Set(
    (progress || []).filter((p) => p.watched).map((p) => p.lesson_id)
  );

  const totalLessons = lessons?.length || 0;
  const watchedCount = watchedIds.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;

  // Aulas recentes (últimas 5 com watched_at)
  const recentProgress = (progress || [])
    .filter((p) => p.watched_at)
    .sort(
      (a, b) =>
        new Date(b.watched_at!).getTime() - new Date(a.watched_at!).getTime()
    )
    .slice(0, 5);

  const recentLessons = recentProgress
    .map((p) => {
      const lesson = lessons?.find((l) => l.id === p.lesson_id);
      return lesson ? { ...lesson, watched_at: p.watched_at } : null;
    })
    .filter(Boolean) as any[];

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin/alunos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para alunos
      </Link>

      {/* Header do aluno */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg-card to-accent/10 p-6 md:p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient font-display text-3xl font-bold text-white shadow-accent-glow">
            {student.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
              {student.full_name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} />
                  {student.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Cadastrado em{" "}
                {format(new Date(student.created_at), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <StudentStatusForm
              studentId={student.id}
              currentStatus={student.status}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {watchedCount} de {totalLessons} aulas concluídas
            </span>
            <span className="font-semibold text-accent">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full rounded-full bg-accent-gradient transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pagamentos */}
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-text-primary">
              Pagamentos
            </h3>
            <CreditCard size={18} className="text-accent" />
          </div>
          {(!payments || payments.length === 0) ? (
            <p className="rounded-lg border border-border bg-bg-elevated/40 p-6 text-center text-sm text-text-muted">
              Nenhum pagamento registrado.
            </p>
          ) : (
            <ul className="space-y-3">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated/40 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {p.paid_at
                        ? format(new Date(p.paid_at), "dd MMM yyyy", {
                            locale: ptBR,
                          })
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      p.status === "approved"
                        ? "bg-accent/15 text-accent"
                        : p.status === "refunded"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-bg-elevated text-text-muted"
                    }`}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Aulas recentes */}
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-text-primary">
              Aulas assistidas recentemente
            </h3>
            <PlayCircle size={18} className="text-accent" />
          </div>
          {recentLessons.length === 0 ? (
            <p className="rounded-lg border border-border bg-bg-elevated/40 p-6 text-center text-sm text-text-muted">
              Nenhuma aula assistida ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated/40 p-3"
                >
                  <CheckCircle2 size={18} className="shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {lesson.title}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {lesson.courses?.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {lesson.watched_at
                      ? format(new Date(lesson.watched_at), "dd/MM", {
                          locale: ptBR,
                        })
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}