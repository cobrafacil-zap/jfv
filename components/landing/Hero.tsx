"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroContent } from "@/lib/landing-content";

/**
 * Hero — equilíbrio 55-60% conteúdo / 40-45% foto.
 * Foto em frame vertical com respiro, sem dominar a viewport.
 */
export function Hero({ content }: { content: HeroContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const t = window.setTimeout(() => setRevealed(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`ps-hero${revealed ? " is-revealed" : ""}`}
      id="hero"
    >
      <div className="ps-hero-bg" aria-hidden />

      <div className="ps-hero-grid">
        <div className="ps-hero-content">
          <div className="ps-hero-eyebrow">{content.eyebrow}</div>

          <h1 className="ps-hero-headline">
            {content.headline.map((line, i) => (
              <span key={i} className="ps-hero-line" style={{ transitionDelay: `${120 + i * 90}ms` }}>
                {line}
              </span>
            ))}
          </h1>

          <p className="ps-hero-sub" style={{ transitionDelay: "360ms" }}>
            {content.sub}
          </p>

          <div className="ps-hero-buttons" style={{ transitionDelay: "440ms" }}>
            <a href={content.primaryCta.href} className="ps-btn ps-btn--primary">
              {content.primaryCta.label}
              <span aria-hidden>→</span>
            </a>
            <a href={content.secondaryCta.href} className="ps-btn ps-btn--ghost">
              {content.secondaryCta.label}
            </a>
          </div>

          <ul className="ps-hero-proof" style={{ transitionDelay: "520ms" }}>
            {content.proof.map((p, i) => (
              <li key={i}>
                <span className="ps-hero-proof-dot" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
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