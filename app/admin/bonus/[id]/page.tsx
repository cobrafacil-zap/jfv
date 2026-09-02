import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { BonusForm } from "@/components/admin/BonusForm";

export const dynamic = "force-dynamic";

export default async function EditarBonusPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: bonus } = await supabaseAdmin
    .from("bonuses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!bonus) notFound();

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin/bonus"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para bônus
      </Link>

      <div className="mb-8">
        <p className="text-sm text-text-muted">Editando</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          {bonus.title}
        </h1>
      </div>

      <BonusForm
        initial={{
          id: bonus.id,
          title: bonus.title,
          description: bonus.description || "",
          file_url: bonus.file_url || "",
          file_path: bonus.file_path || "",
          order_index: bonus.order_index,
          is_published: bonus.is_published,
        }}
      />
    </div>
  );
}
