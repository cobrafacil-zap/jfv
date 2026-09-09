import type { SobreContent } from "@/lib/landing-content";

/**
 * Sobre — composição editorial/assimétrica.
 * Imagem principal deslocada, fotos menores como apoio. Sem tilt 3D infantil.
 */
export function Sobre({ content }: { content: SobreContent }) {
  return (
    <section className="ps-sobre" id="sobre">
      <div className="ps-sobre-inner">
        <div className="ps-sobre-visual">
          <figure className="ps-sobre-fig-main">
            <img
              src={content.photoMain}
              alt="Priscila Sinópolis"
              loading="lazy"
              width={780}
              height={980}
            />
          </figure>
          <figure className="ps-sobre-fig-sm ps-sobre-fig-sm--a">
            <img
              src={content.photoSm1}
              alt="Priscila Sinópolis em ação"
              loading="lazy"
              width={420}
              height={520}
            />
          </figure>
          <figure className="ps-sobre-fig-sm ps-sobre-fig-sm--b">
            <img
              src={content.photoSm2}
              alt="Priscila Sinópolis"
              loading="lazy"
              width={420}
              height={520}
            />
          </figure>
          <span className="ps-sobre-accent" aria-hidden />
        </div>

        <div className="ps-sobre-text">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>

          <h2 className="ps-sobre-title">
            {content.title} <em>{content.highlight}</em>
          </h2>

          <div className="ps-sobre-paras">
            {content.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
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
