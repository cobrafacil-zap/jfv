import type { SobreContent } from "@/lib/landing-content";
import { RichText } from "./RichText";

export function Sobre({ content }: { content: SobreContent }) {
  return (
    <section id="sobre">
      <div className="container">
        <div className="sobre-grid">
          <div className="sobre-mosaic">
            <div className="mosaic-main">
              <img src={content.photoMain} alt="Priscila Sinópolis" loading="lazy" />
            </div>
            <div className="mosaic-sm">
              <img src={content.photoSm1} alt="Priscila Sinópolis" loading="lazy" />
            </div>
            <div className="mosaic-sm">
              <img src={content.photoSm2} alt="Priscila Sinópolis gravando conteúdo" loading="lazy" />
            </div>
          </div>
          <div className="sobre-text">
            <div className="section-eyebrow fade-up">{content.eyebrow}</div>
            <h2 className="section-title fade-up" style={{ transitionDelay: "80ms" }}>
              {content.title}
            </h2>
            {content.paragraphs.map((p, i) => (
              <p key={i} className="fade-up" style={{ transitionDelay: `${160 + i * 80}ms` }}>
                <RichText text={p} />
              </p>
            ))}
            <div className="sobre-tags fade-up" style={{ transitionDelay: "320ms" }}>
              {content.tags.map((t, i) => (
                <span className="tag" key={i}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}