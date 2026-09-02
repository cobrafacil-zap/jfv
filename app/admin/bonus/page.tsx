import Link from "next/link";
import { Plus, Gift, Eye, EyeOff } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { BonusActions } from "@/components/admin/BonusActions";

export const dynamic = "force-dynamic";

export default async function BonusAdminPage() {
  const { data: bonuses } = await supabaseAdmin
    .from("bonuses")
    .select("*")
    .order("order_index");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Materiais extras</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
            Bônus
          </h1>
          <p className="mt-2 text-text-secondary">
            {bonuses?.length || 0} bônus cadastrados.
          </p>
        </div>
        <Link
          href="/admin/bonus/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:brightness-110"
        >
          <Plus size={16} />
          Novo bônus
        </Link>
      </div>

      {(!bonuses || bonuses.length === 0) ? (
        <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
          <Gift size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">Nenhum bônus cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bonuses.map((bonus) => (
            <div
              key={bonus.id}
              className="rounded-2xl border border-border bg-bg-card/50 p-5 transition-all hover:border-accent/40"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-accent-glow-sm">
                  <Gift size={18} />
                </div>
                {bonus.is_published ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                    <Eye size={10} />
                    ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase text-text-muted">
                    <EyeOff size={10} />
                    rascunho
                  </span>
                )}
              </div>

              <h3 className="font-display text-base font-bold text-text-primary">
                {bonus.title}
              </h3>
              {bonus.description && (
                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                  {bonus.description}
                </p>
              )}

              <div className="mt-4">
                <BonusActions bonusId={bonus.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
