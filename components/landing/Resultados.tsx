import type { ResultadosContent } from "@/lib/landing-content";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";

export function Resultados({ content }: { content: ResultadosContent }) {
  return (
    <section className="ps-resultados" id="resultados">
      <div className="ps-resultados-inner">
        <header className="ps-sh tone-center">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">
            {content.title} <em>{content.titleEm}</em>
          </h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <TestimonialCarousel items={content.testimonials} />
      </div>
    </section>
  );
}
