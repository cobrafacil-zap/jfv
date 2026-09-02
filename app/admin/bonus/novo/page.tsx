import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BonusForm } from "@/components/admin/BonusForm";

export const dynamic = "force-dynamic";

export default function NovoBonusPage() {
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
        <p className="text-sm text-text-muted">Materiais extras</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          Novo bônus
        </h1>
      </div>

      <BonusForm />
    </div>
  );
}
