import type { ProdutosContent, ProductCard } from "@/lib/landing-content";

/**
 * Produtos — showcase de cards grandes.
 * Cada card tem cover (imagem ou placeholder), título, descrição curta, preço e CTA.
 * Sem filtros; cards são o catálogo. Limite prático: 4 (controlado pelo admin).
 */
export function ProdutosShowcase({ content }: { content: ProdutosContent }) {
  return (
    <section className="ps-produtos" id="programas">
      <div className="ps-produtos-inner">
        <header className="ps-sh ps-sh--center fade-up">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">
            {content.title} <em>{content.titleEm}</em>
          </h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <div className="ps-produtos-list">
          {content.cards.map((card, i) => (
            <ShowcaseCard key={card.id} card={card} index={i} />
          ))}
        </div>

        {content.allCta?.label && (
          <div className="ps-produtos-foot fade-up">
            <p className="ps-produtos-foot-text">Não sabe qual faz sentido agora?</p>
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

function ShowcaseCard({ card, index }: { card: ProductCard; index: number }) {
  const isExternal = /^https?:\/\//.test(card.href);
  return (
    <article
      className={`ps-pcard${card.featured ? " is-featured" : ""} fade-up`}
      data-index={index}
    >
      <div className="ps-pcard-cover" aria-hidden={!card.coverUrl}>
        {card.coverUrl ? (
          <img src={card.coverUrl} alt="" loading="lazy" />
        ) : (
          <PlaceholderArt title={card.title} category={card.categoryLabel} />
        )}
      </div>
      <div className="ps-pcard-body">
        <div className="ps-pcard-top">
          <span className="ps-pcard-category">{card.categoryLabel}</span>
          {card.featured && <span className="ps-pcard-flag">destaque</span>}
        </div>

        <h3 className="ps-pcard-title">{card.title}</h3>
        <p className="ps-pcard-desc">{card.desc}</p>
        <p className="ps-pcard-ideal">{card.idealFor}</p>

        <div className="ps-pcard-foot">
          <div className="ps-pcard-price">
            {card.price ? (
              <>
                <span className="ps-pcard-price-value">{card.price}</span>
                {card.priceSuffix && (
                  <span className="ps-pcard-price-suffix">{card.priceSuffix}</span>
                )}
              </>
            ) : (
              <span className="ps-pcard-price-consult">Sob consulta</span>
            )}
          </div>
          <a
            href={card.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="ps-btn ps-btn--primary ps-pcard-cta"
          >
            {card.buttonLabel}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </article>
  );
}

function PlaceholderArt({ title, category }: { title: string; category: string }) {
  // Placeholder visual elegante — sem imagem de IA. Gradiente sutil + iniciais.
  const initials = (title || category || "·")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="ps-pcard-placeholder">
      <span className="ps-pcard-placeholder-eyebrow">{category}</span>
      <span className="ps-pcard-placeholder-mark">{initials}</span>
    </div>
  );
}
