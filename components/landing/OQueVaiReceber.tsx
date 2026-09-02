import { Check, Infinity, Users, RefreshCw, MessageCircle, Award } from "lucide-react";

const includes = [
  {
    icon: Infinity,
    title: "Acesso vitalício",
    description: "Assista quando e quantas vezes quiser, sem pressa.",
  },
  {
    icon: Users,
    title: "Comunidade exclusiva",
    description: "Grupo privado de alunas para networking e parcerias.",
  },
  {
    icon: RefreshCw,
    title: "Atualizações gratuitas",
    description: "Todo novo conteúdo é seu, sem custo adicional.",
  },
  {
    icon: MessageCircle,
    title: "Suporte direto",
    description: "Tire suas dúvidas diretamente com a equipe.",
  },
  {
    icon: Award,
    title: "Certificado de conclusão",
    description: "Comprove sua evolução no fim do curso.",
  },
];

export function OQueVaiReceber() {
  return (
    <section className="py-12 md:py-20">
      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent md:mb-4">
            O que está incluso
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Ao entrar no curso, você recebe:
          </h2>
        </div>

        <div className="mx-auto mt-8 max-w-4xl md:mt-12">
          <div className="space-y-3 md:space-y-4">
            {includes.map((item, i) => (
              <div
                key={item.title}
                className="group flex items-start gap-3 rounded-xl border border-border bg-bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-accent animate-fade-up md:gap-4 md:rounded-2xl md:p-5"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-accent-glow-sm md:h-10 md:w-10 md:rounded-xl">
                  <Check size={16} className="stroke-[3] md:size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <item.icon size={16} className="text-accent md:size-[18px]" />
                    <h3 className="text-sm font-semibold text-text-primary md:text-base">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary md:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}