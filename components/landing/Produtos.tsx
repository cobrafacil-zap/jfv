"use client";

import { useMemo, useState } from "react";
import type { ProdutosContent } from "@/lib/landing-content";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductFilter } from "@/components/ui/ProductFilter";

/**
 * Produtos — grid premium com filtros e catálogo expansível.
 * Mostra ~6 cards inicialmente; "Ver todos" abre o catálogo completo.
 */
export function Produtos({ content }: { content: ProdutosContent }) {
  const [active, setActive] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (active === "all") return content.cards;
    return content.cards.filter((c) => c.category === active);
  }, [active, content.cards]);

  // Cap inicial: 6 cards visíveis (a não ser que filtro reduza)
  const visibleCount = 6;
  const visible = showAll ? filtered : filtered.slice(0, visibleCount);
  const hasHidden = filtered.length > visibleCount;

  return (
    <section className="ps-programas" id="programas">
      <div className="ps-programas-inner">
        <header className="ps-sh tone-center">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">
            {content.title} <em>{content.titleEm}</em>
          </h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <ProductFilter
          filters={content.filters}
          active={active}
          onChange={(id) => {
            setActive(id);
            setShowAll(false);
          }}
        />

        <div className="ps-pgrid" data-filter={active}>
          {visible.map((card, i) => (
            <ProductCard key={card.id} card={card} index={i} />
          ))}
        </div>

        {(hasHidden || showAll) && (
          <div className="ps-programas-more">
            {hasHidden && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
              >
                Ver todos os programas
                <span aria-hidden> →</span>
              </button>
            )}
            {showAll && (
              <p className="ps-programas-note">{content.catalogNote}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
