import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentStudent } from "@/lib/auth";
import { PerfilForm } from "@/components/membros/PerfilForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  // Contar aulas assistidas e progresso total
  const { count: watchedCount } = await supabaseAdmin
    .from("student_progress")
    .select("lesson_id", { count: "exact", head: true })
    .eq("student_id", student.id)
    .eq("watched", true);

  const { count: totalLessons } = await supabaseAdmin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  const progressPercent =
    totalLessons && totalLessons > 0
      ? Math.round(((watchedCount || 0) / totalLessons) * 100)
      : 0;

  async function logout() {
    "use server";
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet: { name: string; value: string; options?: any }[]) => {
            try {
              toSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          Meu perfil
        </h1>
        <p className="mt-2 text-text-secondary">
          Gerencie seus dados e acompanhe seu progresso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Resumo */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-bg-card to-accent/10 p-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient font-display text-2xl font-bold text-white shadow-accent-glow">
            {student.full_name.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary">
            {student.full_name}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{student.email}</p>

          <div className="mt-6 space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Status</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  student.status === "active"
                    ? "bg-accent/15 text-accent"
                    : "bg-text-muted/15 text-text-muted"
                }`}
              >
                {student.status === "active" ? "Ativa" : student.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Aulas concluídas</span>
              <span className="font-semibold text-text-primary">
                {watchedCount || 0} / {totalLessons || 0}
              </span>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-text-muted">Progresso geral</span>
                <span className="font-semibold text-accent">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
                <div
                  className="h-full rounded-full bg-accent-gradient transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form + sair */}
        <div className="space-y-6 lg:col-span-2">
          <PerfilForm
            fullName={student.full_name}
            email={student.email}
            phone={student.phone || ""}
          />

          <form
            action={logout}
            className="rounded-2xl border border-border bg-bg-card/50 p-6"
          >
            <h3 className="font-display text-lg font-bold text-text-primary">
              Sair da conta
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Você precisará fazer login novamente para acessar as aulas.
            </p>
            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut size={14} />
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}