"use client";

import type { HeroContent } from "@/lib/landing-content";

/**
 * Hero — equilíbrio 55-60% conteúdo / 40-45% foto.
 * Foto em frame vertical com respiro, sem dominar a viewport.
 */
export function Hero({ content }: { content: HeroContent }) {
  return (
    <section id="hero">
      <div className="hero-visual">
        <div className="hero-photo" style={{ backgroundImage: `url('${content.photoUrl}')` }} />
      </div>
      <div className="hero-content">
        <div className="hero-eyebrow fade-up">{content.eyebrow}</div>
        <h1 className="hero-headline">
          {content.headline.split("\n").map((line, i) => (
            <span key={i} className="fade-up" style={{ display: "block", transitionDelay: `${80 + i * 80}ms` }}>
              {line}
            </span>
          ))}
          {content.headlineEm && (
            <em className="fade-up" style={{ transitionDelay: `${80 + content.headline.split("\n").length * 80}ms` }}>
              {content.headlineEm.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < content.headlineEm.split("\n").length - 1 && <br />}
                </span>
              ))}
            </em>
          )}
        </h1>
        <p className="hero-sub fade-up" style={{ transitionDelay: "300ms" }}>{content.sub}</p>
        <div className="hero-buttons fade-up" style={{ transitionDelay: "380ms" }}>
          <a href={content.primaryCta.href} className="btn-primary">
            {content.primaryCta.label}
          </a>
          <a href={content.secondaryCta.href} className="btn-outline">
            {content.secondaryCta.label}
          </a>
        </div>

        <div className="ps-hero-visual" aria-hidden={false}>
          <div className="ps-hero-frame">
            <div
              className="ps-hero-photo"
              role="img"
              aria-label="Priscila Sinópolis"
              style={{ backgroundImage: `url(${content.photoUrl})` }}
            />
            <div className="ps-hero-frame-tag">JFV</div>
          </div>
          <div className="ps-hero-frame-meta" aria-hidden>
            <span>Estratégia comercial</span>
            <span>—</span>
            <span>Processo</span>
          </div>
        </div>
      </div>
    </section>
  );
}