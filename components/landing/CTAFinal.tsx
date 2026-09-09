import type { CtaContent } from "@/lib/landing-content";

export function CTAFinal({ content }: { content: CtaContent }) {
  const isExternal = (href: string) => href.startsWith("http");

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
          {content.buttons.map((b, i) => (
            <a
              key={i}
              href={b.href}
              target={isExternal(b.href) ? "_blank" : undefined}
              rel={isExternal(b.href) ? "noopener noreferrer" : undefined}
              className={b.variant === "gold" ? "btn-cta-gold" : "btn-cta-outline"}
            >
              {b.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}