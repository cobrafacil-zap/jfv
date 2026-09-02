import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Camila Souza",
    role: "Empreendedora",
    avatar: "CS",
    text: "Eu tinha pavor de aparecer. Hoje gravo stories todos os dias e minha audiência triplicou em 2 meses.",
  },
  {
    name: "Juliana Mendes",
    role: "Coach de Carreira",
    avatar: "JM",
    text: "Método simples e direto. Em uma semana eu já estava editando vídeos profissionais no CapCut.",
  },
  {
    name: "Beatriz Lima",
    role: "Designer",
    avatar: "BL",
    text: "A diferença nos meus reels foi absurda. Saí de 200 views para 50k em um único vídeo.",
  },
  {
    name: "Renata Alves",
    role: "Psicóloga",
    avatar: "RA",
    text: "Sempre achei que precisava de equipamento caro. Meu celular é mais que suficiente.",
  },
  {
    name: "Fernanda Costa",
    role: "Nutricionista",
    avatar: "FC",
    text: "Aprendi a gravar, editar e postar. Meu perfil virou meu principal canal de aquisição.",
  },
  {
    name: "Larissa Pereira",
    role: "Lojista",
    avatar: "LP",
    text: "O investimento que mais retorno me deu. A comunidade de alunas também é incrível.",
  },
];

export function Testimonials() {
  return (
    <section id="depoimentos" className="section-clip py-10 md:py-20">
      <div className="container-custom px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-accent md:mb-3 md:text-xs">
            Depoimentos
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Mais de <span className="text-gradient">12 mil alunas</span> já
            transformaram seus perfis
          </h2>
        </div>

        <div className="mt-6 grid gap-3 md:mt-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="group relative overflow-hidden rounded-xl border border-border bg-bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-accent-glow-sm animate-fade-up md:rounded-2xl md:p-6"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <Quote
                size={24}
                className="absolute -right-1 -top-1 text-accent/20 transition-all group-hover:text-accent/40 md:size-8"
              />

              <div className="mb-2 flex items-center gap-0.5 md:mb-3 md:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className="fill-accent text-accent md:size-[14px]"
                  />
                ))}
              </div>

              <p className="mb-3 text-xs leading-relaxed text-text-secondary md:mb-6 md:text-sm">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-2 border-t border-border pt-2 md:gap-3 md:pt-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-gradient text-[10px] font-bold text-white md:h-10 md:w-10 md:text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary md:text-sm">
                    {t.name}
                  </p>
                  <p className="text-[9px] text-text-muted md:text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}