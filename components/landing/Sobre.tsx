import type { ReactNode } from "react";
import Image from "next/image";
import type { SobreContent } from "@/lib/landing-content";

function escaparRegex(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Destaca trechos do título com a cor de acento, sem depender de HTML.
 * Funciona com o conteúdo editável no admin: se o texto mudar, o destaque
 * simplesmente deixa de aparecer.
 */
function destacar(titulo: string, destaques: string[] = []): ReactNode {
  const frases = destaques.map((d) => d.trim()).filter(Boolean);
  if (!frases.length) return titulo;

  const padrao = new RegExp(`(${frases.map(escaparRegex).join("|")})`, "gi");
  return titulo
    .split(padrao)
    .filter(Boolean)
    .map((parte, i) =>
      frases.some((frase) => frase.toLowerCase() === parte.toLowerCase()) ? (
        <em key={i}>{parte}</em>
      ) : (
        <span key={i}>{parte}</span>
      )
    );
}

/**
 * Sobre — composição editorial/assimétrica.
 * Fotos à esquerda, narrativa curta à direita, indicadores e CTA.
 */
export function Sobre({ content }: { content: SobreContent }) {
  const [primeiro, ...restantes] = content.paragraphs;

  return (
    <section className="ps-sobre" id="sobre">
      <div className="ps-sobre-inner">
        <div className="ps-sobre-visual">
          <figure className="ps-sobre-fig-main">
            <Image
              src={content.photoMain}
              alt="Priscila Sinópolis"
              width={780}
              height={980}
            />
          </figure>
          <figure className="ps-sobre-fig-sm ps-sobre-fig-sm--a">
            <Image
              src={content.photoSm1}
              alt="Priscila Sinópolis em ação"
              width={420}
              height={520}
            />
          </figure>
          <figure className="ps-sobre-fig-sm ps-sobre-fig-sm--b">
            <Image
              src={content.photoSm2}
              alt="Priscila Sinópolis"
              width={420}
              height={520}
            />
          </figure>
        </div>

        <div className="ps-sobre-text">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>

          <h2 className="ps-sobre-title">
            {destacar(content.title, content.titleHighlights)}
            {content.highlight ? (
              <>
                {" "}
                <em>{content.highlight}</em>
              </>
            ) : null}
          </h2>

          {primeiro && <p className="ps-sobre-intro">{primeiro}</p>}

          <div className="ps-sobre-callout">
            <span>Quer aplicar isso no seu negócio?</span>
            <a className="ps-sobre-callout-link" href="#programas">
              Ver os programas
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="ps-sobre-paras">
            {restantes.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {content.tags.length > 0 && (
            <div className="ps-sobre-audience">
              <span className="ps-sobre-audience-label">Para quem é</span>
              <ul className="ps-sobre-tags" aria-label="Para quem é o método">
                {content.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {content.closingLine && (
            <p className="ps-sobre-pull">
              {destacar(content.closingLine, ["É processo."])}
            </p>
          )}

          <ul className="ps-sobre-stats" aria-label="Números">
            {content.stats.map((s, i) => (
              <li key={i} className="ps-sobre-stat">
                <span className="ps-sobre-stat-value">{s.value}</span>
                <span className="ps-sobre-stat-label">{s.label}</span>
              </li>
            ))}
          </ul>

          <a className="ps-btn ps-btn--primary ps-sobre-cta" href="#programas">
            Quero aprender a vender melhor
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
