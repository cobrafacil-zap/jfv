"use client";

import type { ProductCard as ProductCardType } from "@/lib/landing-content";

/**
 * ProductCard — card premium de programa.
 * Estrutura: categoria · título · descrição · ideal · preço · CTA.
 */
export function ProductCard({
  card,
  index = 0,
}: {
  card: ProductCardType;
  index?: number;
}) {
  const isExternal = card.href.startsWith("http");

  return (
    <article
      className={`ps-pcard${card.featured ? " is-featured" : ""}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="ps-pcard-top">
        <span className="ps-pcard-cat">{card.categoryLabel}</span>
        {card.featured && <span className="ps-pcard-flag">Destaque</span>}
      </div>

      <h3 className="ps-pcard-title">{card.title}</h3>

      <p className="ps-pcard-desc">{card.desc}</p>

      <div className="ps-pcard-ideal">
        <span className="ps-pcard-ideal-label">Ideal para</span>
        <span className="ps-pcard-ideal-text">{card.idealFor}</span>
      </div>

      <div className="ps-pcard-bottom">
        {card.price ? (
          <div className="ps-pcard-price">
            <span className="ps-pcard-price-num">{card.price}</span>
            {card.priceSuffix && (
              <span className="ps-pcard-price-suffix">{card.priceSuffix}</span>
            )}
          </div>
        ) : (
          <div className="ps-pcard-price ps-pcard-price--quote">Sob consulta</div>
        )}
        <a
          href={card.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="ps-pcard-cta"
        >
          {card.buttonLabel}
          <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  );
}