import type { ResultadosContent } from "@/lib/landing-content";

export function Resultados({ content }: { content: ResultadosContent }) {
  return (
    <section id="resultados">
      <div className="container">
        <div className="resultados-header">
          <div className="section-eyebrow eyebrow-center">{content.eyebrow}</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            {content.title}
          </h2>
          <p className="section-sub sub-center">{content.sub}</p>
        </div>

        <p className="depos-title">O que nossos alunos dizem</p>
        <div className="depos-grid">
          {content.testimonials.map((t, i) => (
            <div className="depo-card fade-up" key={i}>
              <div className="depo-stars">★★★★★</div>
              <p className="depo-text">&ldquo;{t.text}&rdquo;</p>
              <div className="depo-author-row">
                <div className="depo-avatar">{t.avatar}</div>
                <div>
                  <span className="depo-author-name">{t.name}</span>
                  <span className="depo-author-role">{t.role}</span>
                </div>
              </div>
              <span className="depo-product">{t.product}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
