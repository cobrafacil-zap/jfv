"use client";

import type { CtaContent } from "@/lib/landing-content";
import { useMagnetic } from "./use-landing-effects";

export function CTAFinal({ content }: { content: CtaContent }) {
  const isExternal = (href: string) => href.startsWith("http");
  const goldRef = useMagnetic<HTMLAnchorElement>(0.18);
  const outlineRef = useMagnetic<HTMLAnchorElement>(0.12);

  return (
    <section id="cta">
      <div className="container" style={{ maxWidth: 760 }}>
        <div
          className="section-eyebrow eyebrow-center fade-up"
          style={{ justifyContent: "center", marginBottom: 20 }}
        >
          {content.eyebrow}
        </div>
        <h2 className="cta-headline fade-up" style={{ transitionDelay: "80ms" }}>
          {content.headline} <em>{content.headlineEm}</em>
        </h2>
        <p className="cta-sub fade-up" style={{ transitionDelay: "160ms" }}>
          {content.sub}
        </p>
        <div className="cta-buttons fade-up" style={{ transitionDelay: "240ms" }}>
          {content.buttons.map((b, i) => {
            const ref = i === 0 ? goldRef : outlineRef;
            return (
              <a
                key={i}
                ref={ref}
                href={b.href}
                target={isExternal(b.href) ? "_blank" : undefined}
                rel={isExternal(b.href) ? "noopener noreferrer" : undefined}
                className={b.variant === "gold" ? "btn-cta-gold magnetic-btn" : "btn-cta-outline magnetic-btn"}
              >
                {b.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
