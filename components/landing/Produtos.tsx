import type { ProdutosContent } from "@/lib/landing-content";
import { ProductCard } from "@/components/ui/ProductCard";

/**
 * Produtos — três programas. Sem filtros, sem expansão.
 * Catálogo fixo, edição direta via admin.
 */
export function Produtos({ content }: { content: ProdutosContent }) {
  return (
    <section className="ps-programas" id="programas">
      <div className="ps-programas-inner">
        <header className="ps-sh">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">
            {content.title} <em>{content.titleEm}</em>
          </h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <div className="ps-pgrid">
          {content.cards.map((card, i) => (
            <ProductCard key={card.id} card={card} index={i} />
          ))}
        </div>

        {content.allCta?.label && (
          <div className="ps-programas-foot">
            <p className="ps-programas-foot-text">Não sabe qual faz sentido agora?</p>
            <a
              className="ps-btn ps-btn--ghost"
              href={content.allCta.href}
              target={content.allCta.href.startsWith("http") ? "_blank" : undefined}
              rel={content.allCta.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {content.allCta.label} →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
