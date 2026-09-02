import { Gift, Download, FileText } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BonusPage() {
  const { data: bonuses } = await supabaseAdmin
    .from("bonuses")
    .select("*")
    .order("order_index");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          <Gift size={14} />
          <span>Bônus exclusivos</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-text-primary md:text-4xl">
          Materiais extras para você
        </h1>
        <p className="mt-2 text-text-secondary">
          Templates, checklists e materiais complementares ao curso.
        </p>
      </div>

      {(!bonuses || bonuses.length === 0) ? (
        <div className="rounded-2xl border border-border bg-bg-card/50 p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary">
            Em breve novos bônus serão disponibilizados.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bonuses.map((bonus) => (
            <div
              key={bonus.id}
              className="rounded-2xl border border-border bg-bg-card/50 p-6 transition-all hover:border-accent hover:shadow-accent-glow-sm"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-accent-glow-sm">
                <Gift size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                {bonus.title}
              </h3>
              {bonus.description && (
                <p className="mt-2 text-sm text-text-secondary">
                  {bonus.description}
                </p>
              )}
              {bonus.file_url && (
                <a
                  href={bonus.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white"
                >
                  <Download size={14} />
                  Baixar
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}