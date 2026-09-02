"use client";

import type { ProdutosContent } from "@/lib/landing-content";

function ProductCard({
  card,
  index,
}: {
  card: ProdutosContent["cards"][number];
  index: number;
}) {
  const isKiwify = card.button.variant === "gold";
  const href = isKiwify ? "https://pay.kiwify.com.br/3X8I06c" : card.button.href;

  return (
    <div
      className={`card fade-up${card.featured ? " card-featured" : ""}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span className={`card-badge ${card.badgeClass}`}>{card.badge}</span>
      <h3 className="card-title">{card.title}</h3>
      {card.price && (
        <div className="card-price">
          {card.price}
          {card.priceSuffix && <span> {card.priceSuffix}</span>}
        </div>
      )}
      <p className="card-desc">{card.desc}</p>
      <ul className="card-benefits">
        {card.benefits.map((b, j) => (
          <li key={j}>{b}</li>
        ))}
      </ul>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-card ${isKiwify ? "btn-gold" : "btn-navy"}`}
      >
        {card.button.label}
      </a>
    </div>
  );
}

export function Produtos({ content }: { content: ProdutosContent }) {
  return (
    <section id="produtos" className="stagger-section">
      <div className="container">
        <div className="produtos-header">
          <div className="section-eyebrow eyebrow-center fade-up">{content.eyebrow}</div>
          <h2 className="section-title fade-up" style={{ textAlign: "center", transitionDelay: "80ms" }}>
            {content.title}
          </h2>
          <p className="section-sub sub-center fade-up" style={{ transitionDelay: "160ms" }}>{content.sub}</p>
        </div>
        <div className="cards-grid">
          {content.cards.map((card, i) => (
            <ProductCard key={i} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
