"use client";

import type { HeroContent } from "@/lib/landing-content";

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
        <div className="hero-badges">
          {content.badges.map((b, i) => (
            <div className="badge fade-up" key={i} style={{ transitionDelay: `${460 + i * 70}ms` }}>
              <div className="badge-icon">✓</div>
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}