import type { ClosingContent } from "@/lib/landing-content";

/**
 * Closing — encerramento forte.
 * Foto de fundo com overlay escuro + headline gigante + CTA único.
 */
export function Closing({ content }: { content: ClosingContent }) {
  const isExternal = (href: string) => /^https?:\/\//.test(href);
  return (
    <section
      className="ps-closing"
      id="cta-final"
      style={{ backgroundImage: `url(${content.photoUrl})` }}
    >
      <div className="ps-closing-overlay" aria-hidden />
      <div className="ps-closing-inner fade-up">
        <div className="ps-sh-eyebrow">{content.eyebrow}</div>
        <h2 className="ps-closing-title">
          {content.headline}{" "}
          <em>{content.headlineEm}</em>
        </h2>
        <p className="ps-closing-sub">{content.sub}</p>
        <div className="ps-closing-buttons">
          <a
            href={content.primaryCta.href}
            target={isExternal(content.primaryCta.href) ? "_blank" : undefined}
            rel={isExternal(content.primaryCta.href) ? "noopener noreferrer" : undefined}
            className="ps-btn ps-btn--primary ps-closing-cta"
          >
            {content.primaryCta.label}
            <span aria-hidden>→</span>
          </a>
          {content.secondaryCta?.label && (
            <a
              href={content.secondaryCta.href}
              target={isExternal(content.secondaryCta.href) ? "_blank" : undefined}
              rel={isExternal(content.secondaryCta.href) ? "noopener noreferrer" : undefined}
              className="ps-btn ps-btn--ghost"
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
