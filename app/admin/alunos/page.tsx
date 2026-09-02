import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, ChevronRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { StudentsFilter } from "@/components/admin/StudentsFilter";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string; status?: string };
}

function formatCurrency(value: number | null) {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function AlunosPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status || "all";

  let query = supabaseAdmin
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: students } = await query;

  const counts = {
    all: students?.length || 0,
    active: 0,
    pending: 0,
    refunded: 0,
  };

  // Contagem por status (para o filtro)
  const { data: allStudents } = await supabaseAdmin
    .from("students")
    .select("status");
  for (const s of allStudents || []) {
    if (s.status === "active") counts.active++;
    else if (s.status === "pending") counts.pending++;
    else if (s.status === "refunded") counts.refunded++;
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <p className="text-sm text-text-muted">Gerenciar</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          Alunos
        </h1>
        <p className="mt-2 text-text-secondary">
          {counts.all} aluno{counts.all !== 1 ? "s" : ""} cadastrado
          {counts.all !== 1 ? "s" : ""}.
        </p>
      </div>

      <StudentsFilter
        initialQ={q}
        initialStatus={statusFilter}
        counts={counts}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-card/50">
        <div className="hidden border-b border-border bg-bg-elevated/30 p-4 text-xs font-semibold uppercase tracking-wider text-text-muted md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr_40px] md:gap-4">
          <div>Nome</div>
          <div>E-mail</div>
          <div>Status</div>
          <div>Valor pago</div>
          <div>Data</div>
          <div></div>
        </div>

        {(!students || students.length === 0) ? (
          <div className="p-12 text-center text-text-muted">
            Nenhum aluno encontrado com esses filtros.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {students.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/alunos/${s.id}`}
                  className="grid items-center gap-3 p-4 transition-colors hover:bg-bg-elevated/40 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_40px] md:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-sm font-bold text-accent">
                      {s.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate font-semibold text-text-primary">
                      {s.full_name}
                    </span>
                  </div>
                  <span className="truncate text-sm text-text-secondary">
                    {s.email}
                  </span>
                  <span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        s.status === "active"
                          ? "bg-accent/15 text-accent"
                          : s.status === "refunded"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {s.status}
                    </span>
                  </span>
                  <span className="text-sm text-text-secondary">
                    {formatCurrency(s.amount_paid)}
                  </span>
                  <span className="text-sm text-text-muted">
                    {s.created_at
                      ? format(new Date(s.created_at), "dd MMM yyyy", {
                          locale: ptBR,
                        })
                      : "—"}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-text-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
