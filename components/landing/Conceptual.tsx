import type { ConceptualContent } from "@/lib/landing-content";

/**
 * Conceptual — "O produto muda. A lógica da venda não."
 * Grid de cards + faixa de segmentos.
 */
export function Conceptual({ content }: { content: ConceptualContent }) {
  return (
    <section className="ps-conceptual" id="logica">
      <div className="ps-conceptual-inner">
        <header className="ps-sh tone-center">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">
            {content.title} <em>{content.titleEm}</em>
          </h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <div className="ps-conceptual-stage">
          {content.cards.map((c, i) => (
            <article className="ps-conceptual-card" key={i}>
              <span className="ps-conceptual-card-num">
                0{i + 1}
              </span>
              <h3 className="ps-conceptual-card-title">{c.title}</h3>
              <p className="ps-conceptual-card-text">{c.text}</p>
            </article>
          ))}
        </div>

        <div className="ps-conceptual-marquee" aria-hidden>
          {content.words.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>

        {content.closing && (
          <p
            className="ps-positioning-paragraph"
            style={{ textAlign: "center", marginTop: 48, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}
          >
            {content.closing}
          </p>
        )}
      </div>
    </section>
  );
}
