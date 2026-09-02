import { Check, ShieldCheck, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const PRICE_FULL = 0.50;
const PRICE_CURRENT = 0.10;
const INSTALLMENTS = 3;
const INSTALLMENT_PRICE = 0.03;

export function Pricing() {
  return (
    <section id="oferta" className="section-clip relative py-10 md:py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-3xl md:h-[600px] md:w-[600px]" />
      </div>

      <div className="container-custom px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent md:mb-4">
            Oferta de lançamento
          </span>
          <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Garanta sua vaga por{" "}
            <span className="text-gradient">menos de R$0,10 por dia</span>
          </h2>
          <p className="mt-3 text-sm text-text-secondary md:mt-4 md:text-lg">
            Acesso completo ao curso + todos os bônus por um investimento
            que cabe no seu bolso.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-2xl animate-fade-up md:mt-16">
          <div className="relative overflow-hidden rounded-2xl border-2 border-accent bg-gradient-to-br from-bg-card via-bg-card to-accent/10 p-4 shadow-accent-glow md:rounded-3xl md:p-12">
            <div className="absolute right-4 top-4 rounded-full bg-accent-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-accent-glow-sm md:right-6 md:top-6 md:px-4 md:py-1.5 md:text-xs">
              Mais escolhido
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent md:text-sm">
                Acesso completo + bônus
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-text-primary md:mt-3 md:text-2xl">
                Como gravar bons vídeos pelo celular
              </h3>

              <div className="mt-6 md:mt-8">
                <p className="text-xs text-text-muted md:text-sm">De</p>
                <p className="mt-1 font-display text-xl font-bold text-text-secondary line-through md:mt-1 md:text-2xl">
                  {formatPrice(PRICE_FULL)}
                </p>
                <p className="mt-2 text-xs text-text-secondary md:mt-3 md:text-sm">Por apenas</p>
                <p className="mt-1 font-display text-5xl font-bold text-gradient md:mt-2 md:text-6xl lg:text-7xl">
                  {formatPrice(PRICE_CURRENT)}
                </p>
                <p className="mt-2 text-xs text-text-secondary md:mt-3 md:text-sm">
                  ou{" "}
                  <strong className="font-bold text-text-primary">
                    {INSTALLMENTS}x de {formatPrice(INSTALLMENT_PRICE)}
                  </strong>{" "}
                  no cartão
                </p>
              </div>

              <ul className="mt-5 space-y-1.5 text-left md:mt-10 md:space-y-3">
                {[
                  "Acesso vitalício ao curso completo",
                  "6 módulos com aulas práticas",
                  "Comunidade exclusiva de alunas",
                  "Checklist de gravação (PDF)",
                  "Templates de edição prontos",
                  "Atualizações gratuitas pra sempre",
                  "Suporte direto com a equipe",
                  "Certificado de conclusão",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 md:gap-3">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent md:h-5 md:w-5">
                      <Check size={10} className="stroke-[3] md:size-3" />
                    </div>
                    <span className="text-xs text-text-primary md:text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 md:mt-10">
                <Button asChild size="xl" className="w-full">
                  <a href="https://pay.kiwify.com.br/3X8I06c" target="_blank" rel="noopener noreferrer">Quero garantir minha vaga</a>
                </Button>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-text-muted md:mt-4 md:gap-4 md:text-xs">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="md:size-[14px]" />
                    Garantia 7 dias
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard size={12} className="md:size-[14px]" />
                    Pagamento seguro
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="md:size-[14px]" />
                    Acesso imediato
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}