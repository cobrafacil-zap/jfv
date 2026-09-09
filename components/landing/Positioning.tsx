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
        <div className="ps-sh tone-light">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
        </div>

        <h2 className="ps-positioning-title">
          {content.title.map((line, i) => (
            <span key={i} className="ps-positioning-line">
              {line}
            </span>
          ))}
        </h2>

        <div className="ps-positioning-body">
          {content.paragraphs.map((p, i) => (
            <p key={i} className={i === content.paragraphs.length - 1 ? "is-emph" : ""}>
              {p}
            </p>
          ))}
        </div>

        <ul className="ps-positioning-chips" aria-label="Etapas do método">
          {content.chips.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}