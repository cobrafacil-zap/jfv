import type { ConceptualContent } from "@/lib/landing-content";

/**
 * Conceptual — "O produto muda. A lógica da venda não."
 * Marquee horizontal de segmentos (tipografia) + composição visual.
 */
export function Conceptual({ content }: { content: ConceptualContent }) {
  // Triplica o array para loop visual contínuo no marquee.
  const loop = [...content.words, ...content.words, ...content.words];

  return (
    <section className="ps-conceptual" id="logica">
      <div className="ps-conceptual-inner">
        <header className="ps-sh ps-sh-center tone-light">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">
            {content.title} <em>{content.titleEm}</em>
          </h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <div className="ps-conceptual-stage" aria-hidden>
          <div className="ps-conceptual-track">
            {loop.map((w, i) => (
              <span className="ps-conceptual-word" key={i}>
                {w}
                <span className="ps-conceptual-bullet">•</span>
              </span>
            ))}
          </div>
        </div>

        <p className="ps-conceptual-closing">{content.closing}</p>
      </div>
    </section>
  );
}