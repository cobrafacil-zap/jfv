import { Camera, Edit3, TrendingUp, DollarSign } from "lucide-react";

const personas = [
  {
    icon: Camera,
    title: "Você quer aparecer mais",
    description:
      "Sente que precisa criar conteúdo mas trava na hora de gravar.",
  },
  {
    icon: Edit3,
    title: "Não sabe editar",
    description:
      "Tem o material bruto mas não consegue transformar em algo profissional.",
  },
  {
    icon: TrendingUp,
    title: "Quer resultado profissional",
    description:
      "Quer vídeos com cara de produção, sem precisar de equipamento caro.",
  },
  {
    icon: DollarSign,
    title: "Quer monetizar",
    description:
      "Entende que conteúdo bem feito é o caminho para fechar mais vendas.",
  },
];

export function ParaQuem() {
  return (
    <section className="py-12 md:py-20">
      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent md:mb-4">
            Para quem é
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Este curso é pra você que:
          </h2>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {personas.map((p, i) => (
            <div
              key={p.title}
              className="group rounded-xl border border-border bg-bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-accent-glow-sm animate-fade-up md:rounded-2xl md:p-6"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white md:mb-4 md:h-12 md:w-12 md:rounded-xl">
                <p.icon size={18} className="md:size-[22px]" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-text-primary md:mb-2 md:text-lg">
                {p.title}
              </h3>
              <p className="text-xs leading-relaxed text-text-secondary md:text-sm">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}