import type { SobreContent } from "@/lib/landing-content";
import { RichText } from "./RichText";

/**
 * Sobre — composição editorial/assimétrica.
 * Imagem principal deslocada, fotos menores como apoio. Sem tilt 3D infantil.
 */
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

          <h2 className="ps-sobre-title">
            {content.title} <em>{content.highlight}</em>
          </h2>

          <div className="ps-sobre-paras">
            {content.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="sobre-tags fade-up" style={{ transitionDelay: "320ms" }}>
              {content.tags.map((t, i) => (
                <span className="tag" key={i}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <dl className="ps-sobre-stats">
            {content.stats.map((s) => (
              <div className="ps-sobre-stat" key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>

          <ul className="ps-sobre-tags" aria-label="Áreas de atuação">
            {content.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}