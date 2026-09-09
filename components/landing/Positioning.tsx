"use client";

import type { PositioningContent } from "@/lib/landing-content";

/**
 * Positioning — "Vendas não são talento. São processo."
 * Tipografia gigante, editorial, com chips discretos.
 */
export function Positioning({ content }: { content: PositioningContent }) {
  return (
    <section className="ps-positioning" id="positioning">
      <div className="ps-positioning-inner">
        <div>
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-positioning-headline">
            {content.title.map((line, i) => (
              <span key={i}>
                {line}
                {i < content.title.length - 1 && " "}
              </span>
            ))}
          </h2>
          {content.paragraphs.map((p, i) => (
            <p key={i} className="ps-positioning-paragraph">
              {p}
            </p>
          ))}
          <ul className="ps-positioning-chips" aria-label="Etapas do método">
            {content.chips.map((c) => (
              <li key={c} className="ps-positioning-chip">
                {c}
              </li>
            ))}
          </ul>
        </div>

        <aside className="ps-positioning-statement">
          <p className="ps-positioning-quote">
            <em>“</em>
            {content.quote}
            <em>”</em>
          </p>
          <div className="ps-positioning-meta">
            <span className="ps-positioning-meta-rule" aria-hidden />
            <span>{content.quoteSource}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
