"use client";

import type { CtaContent } from "@/lib/landing-content";

/**
 * CTASection — bloco de conversão premium.
 * Fundo escuro/grafite com detalhes roxos.
 */
export function CTASection({ content }: { content: CtaContent }) {
  const isExternal = (href: string) => href.startsWith("http");

  return (
    <section className="ps-cta" id="cta-final">
      <div className="ps-cta-bg" aria-hidden />
      <div className="ps-cta-grain" aria-hidden />
      <div className="ps-cta-inner">
        <div className="ps-cta-eyebrow">{content.eyebrow}</div>
        <h2 className="ps-cta-title">
          {content.title.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h2>
        <p className="ps-cta-sub">{content.sub}</p>
        <div className="ps-cta-buttons">
          <a
            href={content.primary.href}
            target={isExternal(content.primary.href) ? "_blank" : undefined}
            rel={isExternal(content.primary.href) ? "noopener noreferrer" : undefined}
            className="ps-cta-btn ps-cta-btn--primary"
          >
            {content.primary.label}
          </a>
          <a
            href={content.secondary.href}
            target={isExternal(content.secondary.href) ? "_blank" : undefined}
            rel={isExternal(content.secondary.href) ? "noopener noreferrer" : undefined}
            className="ps-cta-btn ps-cta-btn--ghost"
          >
            {content.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}