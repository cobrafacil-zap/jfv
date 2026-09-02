import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CourseForm } from "@/components/admin/CourseForm";

export const dynamic = "force-dynamic";

export default function NovoModuloPage() {
  return (
    <div className="p-6 md:p-10">
      <Link
        href="/admin/modulos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Voltar para módulos
      </Link>

      <div className="mb-8">
        <p className="text-sm text-text-muted">Conteúdo</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
          Novo módulo
        </h1>
      </div>

      <CourseForm />
    </div>
  );
}
