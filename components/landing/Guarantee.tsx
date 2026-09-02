import { ShieldCheck } from "lucide-react";

export function Guarantee() {
  return (
    <section className="py-10 md:py-16">
      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-bg-card/30 p-5 backdrop-blur-sm md:rounded-3xl md:p-12 animate-fade-up">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-accent bg-accent/10 md:h-32 md:w-32">
                <div className="text-center">
                  <ShieldCheck size={28} className="mx-auto text-accent md:size-9" />
                  <p className="mt-1 font-display text-sm font-bold text-accent md:mt-1 md:text-lg">
                    7 dias
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-text-primary md:text-3xl">
                  Garantia incondicional de 7 dias
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary md:mt-3 md:text-base">
                  Entre no curso, assista às aulas, aplique o método. Se em até
                  7 dias você sentir que{" "}
                  <strong className="text-text-primary">não vale o investimento</strong>,
                  basta enviar um e-mail e devolvemos{" "}
                  <strong className="text-accent">100% do seu dinheiro</strong>.
                  Sem perguntas, sem burocracia.
                </p>
                <p className="mt-2 text-xs text-text-muted md:mt-3 md:text-sm">
                  Todo o risco é nosso. A decisão é sua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}