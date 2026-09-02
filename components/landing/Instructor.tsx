import { Instagram, Award, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Users, value: "+120k", label: "Seguidores" },
  { icon: Award, value: "+7 anos", label: "Criando conteúdo" },
  { icon: Heart, value: "+12k", label: "Alunas" },
];

export function Instructor() {
  return (
    <section id="sobre" className="section-clip relative py-10 md:py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl md:h-[400px] md:w-[400px]" />
      </div>

      <div className="container-custom px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-accent md:mb-3 md:text-xs">
            Quem vai te ensinar
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Oi, eu sou a{" "}
            <span className="text-gradient">Priscila Sinópolis</span>
          </h2>
        </div>

        <div className="mt-6 grid items-center gap-6 md:mt-10 lg:grid-cols-5 lg:gap-10">
          {/* Image */}
          <div className="relative mx-auto w-full max-w-xs animate-fade-up lg:col-span-2 lg:max-w-none">
            <div className="video-frame relative aspect-[4/5] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-bg-card to-bg-secondary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient text-xl font-bold text-white shadow-accent-glow md:h-24 md:w-24 md:text-3xl">
                    PS
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white md:mt-4">
                    Priscila Sinópolis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-up lg:col-span-3">
            <div className="space-y-2 text-sm leading-relaxed text-text-secondary md:space-y-3 md:text-base">
              <p>
                Sou comunicadora e criadora de conteúdo há mais de 7 anos.
                Comecei gravando do meu quarto, sem equipamento profissional.
              </p>
              <p>
                Hoje tenho <strong className="text-text-primary">+120 mil seguidores</strong> e
                milhares de alunas. Criei esse curso pra mostrar o caminho que percorri —
                sem enrolação, sem câmera cara.
              </p>
              <p>
                Se eu consegui, com a graça de Deus e muita prática,{" "}
                <strong className="text-text-primary">você também consegue.</strong>
              </p>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-2 md:mt-6 md:gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-bg-card/50 p-2 text-center md:rounded-xl md:p-3"
                >
                  <s.icon size={14} className="mx-auto mb-1 text-accent md:size-5" />
                  <p className="font-display text-sm font-bold text-text-primary md:text-lg">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[9px] text-text-secondary md:text-[11px]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-6 md:gap-3">
              <Button asChild size="default" className="w-full sm:w-auto">
                <a href="#oferta">Quero aprender com você</a>
              </Button>
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto">
                <a
                  href="https://www.instagram.com/priscila_sinopolis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Instagram size={16} />
                  Seguir
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}