import type { MetodoContent } from "@/lib/landing-content";

export function Metodo({ content }: { content: MetodoContent }) {
  return (
    <section id="metodo">
      <div className="container">
        <div className="metodo-header">
          <div className="section-eyebrow eyebrow-center">{content.eyebrow}</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            {content.title}
          </h2>
          <p className="section-sub sub-center">{content.sub}</p>
        </div>
        <div className="pilares-wrapper">
          <div className="pilares-grid">
            {content.steps.map((s, i) => (
              <div className="pilar fade-up" key={i}>
                <div className="pilar-bubble">{s.emoji}</div>
                <div className="pilar-step">{s.step}</div>
                <div className="pilar-name">{s.name}</div>
                <div className="pilar-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}