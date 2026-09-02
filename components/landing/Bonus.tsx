import { Gift, FileText, Users, Smartphone } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const bonuses = [
  {
    icon: FileText,
    title: "Checklist de Gravação",
    description:
      "PDF com todos os itens para conferir antes de gravar qualquer vídeo.",
    value: 97,
  },
  {
    icon: Users,
    title: "Comunidade Exclusiva",
    description:
      "Grupo privado de alunas para networking, dúvidas e parcerias.",
    value: 197,
  },
  {
    icon: Smartphone,
    title: "Templates de Edição",
    description:
      "Pacote de modelos prontos de CapCut para você editar em minutos.",
    value: 147,
  },
];

const totalValue = bonuses.reduce((sum, b) => sum + b.value, 0);

export function Bonus() {
  return (
    <section className="section-clip py-10 md:py-20">
      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent md:mb-4 md:px-4 md:py-1.5 md:text-xs">
            <Gift size={12} className="md:size-[14px]" />
            <span>Bônus exclusivos</span>
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Ao entrar hoje, você ainda ganha:
          </h2>
        </div>

        <div className="mt-6 grid gap-3 md:mt-12 md:gap-6 lg:grid-cols-3">
          {bonuses.map((b, i) => (
            <div
              key={b.title}
              className="group relative overflow-hidden rounded-xl border-2 border-accent/40 bg-gradient-to-br from-accent/10 via-bg-card to-bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-accent-glow-sm animate-fade-up md:rounded-2xl md:p-7"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-gradient text-base font-bold text-white shadow-accent-glow rotate-12 md:-right-3 md:-top-3 md:h-20 md:w-20 md:text-2xl">
                +
              </div>

              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-accent-glow-sm md:mb-5 md:h-12 md:w-12 md:rounded-xl">
                <b.icon size={16} className="md:size-[22px]" />
              </div>

              <h3 className="mb-1 font-display text-sm font-bold text-text-primary md:mb-2 md:text-xl">
                {b.title}
              </h3>
              <p className="mb-2 text-xs leading-relaxed text-text-secondary md:mb-4 md:text-sm">
                {b.description}
              </p>

              <div className="border-t border-border pt-2 md:pt-4">
                <p className="text-[9px] uppercase tracking-wider text-text-muted md:text-xs">
                  Valor
                </p>
                <p className="mt-0.5 font-display text-base font-bold text-text-primary line-through opacity-60 md:mt-1 md:text-2xl">
                  {formatPrice(b.value)}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-accent md:mt-1 md:text-sm">
                  GRÁTIS pra você
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-accent bg-accent/5 p-4 text-center animate-fade-up md:mt-10 md:rounded-2xl md:p-6">
          <p className="text-xs text-text-secondary md:text-sm">
            Valor total dos bônus:{" "}
            <span className="font-bold text-text-primary line-through">
              {formatPrice(totalValue)}
            </span>
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary md:mt-2 md:text-lg">
            Tudo isso incluso na sua matrícula.
          </p>
        </div>
      </div>
    </section>
  );
}