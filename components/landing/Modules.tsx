import { Camera, Smartphone, Mic, Instagram, Film, Sparkles } from "lucide-react";

const modules = [
  {
    number: "01",
    icon: Camera,
    title: "Fundamentos da Imagem",
    description:
      "Domine luz, enquadramento, ângulo e composição. A base de qualquer vídeo profissional.",
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Seu Celular como Câmera Pro",
    description:
      "Configurações ocultas do iPhone e Android que deixam seu vídeo com qualidade de cinema.",
  },
  {
    number: "03",
    icon: Mic,
    title: "Áudio que Prende a Atenção",
    description:
      "Como capturar áudio limpo e usar a voz para criar conexão real com sua audiência.",
  },
  {
    number: "04",
    icon: Instagram,
    title: "Stories Magnéticos",
    description:
      "Estratégias práticas para gravar stories que prendem do primeiro ao último segundo.",
  },
  {
    number: "05",
    icon: Film,
    title: "Reels que Viralizam",
    description:
      "O passo a passo para criar reels com potencial de viralizar, mesmo começando do zero.",
  },
  {
    number: "06",
    icon: Sparkles,
    title: "Edição Profissional no Celular",
    description:
      "Domine CapCut e InShot do básico ao avançado. Cortes, transições, textos e efeitos.",
  },
];

export function Modules() {
  return (
    <section id="modulos" className="section-clip py-10 md:py-20">
      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent md:mb-4">
            Conteúdo do curso
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            6 módulos completos para você{" "}
            <span className="text-gradient">dominar a câmera</span>
          </h2>
          <p className="mt-3 text-sm text-text-secondary md:mt-4 md:text-lg">
            Do básico ao avançado, um caminho claro para criar vídeos
            profissionais direto do celular.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:mt-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {modules.map((m, i) => (
            <div
              key={m.number}
              className="group relative overflow-hidden rounded-xl border border-border bg-bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-accent-glow-sm animate-fade-up md:rounded-2xl md:p-7"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="absolute -right-2 -top-2 font-display text-5xl font-bold text-accent/10 transition-all group-hover:text-accent/20 md:text-7xl">
                {m.number}
              </div>

              <div className="relative">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-accent-glow-sm md:mb-5 md:h-12 md:w-12 md:rounded-xl">
                  <m.icon size={16} className="md:size-[22px]" />
                </div>
                <h3 className="mb-1 font-display text-sm font-bold text-text-primary md:mb-2 md:text-xl">
                  {m.title}
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary md:text-sm">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}