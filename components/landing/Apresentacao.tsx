import type { ApresentacaoContent } from "@/lib/landing-content";

/**
 * Apresentação — abertura personal-brand.
 * Foto vertical + nome + método + tagline + stats inline + CTAs + socials.
 * Não usa background-image (a foto fica visível e o fundo fixo fica atrás).
 */
export function Apresentacao({ content }: { content: ApresentacaoContent }) {
  const isExternal = (href: string) => /^https?:\/\//.test(href);
  const igHandle = content.instagramHandle || "";
  const igUrl = igHandle
    ? `https://www.instagram.com/${igHandle.replace(/^@/, "")}/`
    : null;

  return (
    <section className="ps-apresentacao" id="apresentacao">
      <div className="ps-apresentacao-inner">
        <div className="ps-apresentacao-text fade-up">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>

          <h1 className="ps-apresentacao-name">
            {content.name}
          </h1>

          <div className="ps-apresentacao-method">{content.method}</div>

          <p className="ps-apresentacao-tagline">
            {content.tagline}
          </p>

          <p className="ps-apresentacao-sub">
            {content.sub}
          </p>

          <div className="ps-apresentacao-buttons">
            <a
              href={content.primaryCta.href}
              className="ps-btn ps-btn--primary"
              target={isExternal(content.primaryCta.href) ? "_blank" : undefined}
              rel={isExternal(content.primaryCta.href) ? "noopener noreferrer" : undefined}
            >
              {content.primaryCta.label}
              <span aria-hidden>→</span>
            </a>
            <a
              href={content.secondaryCta.href}
              className="ps-btn ps-btn--ghost"
              target={isExternal(content.secondaryCta.href) ? "_blank" : undefined}
              rel={isExternal(content.secondaryCta.href) ? "noopener noreferrer" : undefined}
            >
              {content.secondaryCta.label}
            </a>
          </div>

          <ul className="ps-apresentacao-stats" aria-label="Autoridade">
            {content.stats.map((s, i) => (
              <li key={i}>
                <span className="ps-apresentacao-stat-value">{s.value}</span>
                <span className="ps-apresentacao-stat-label">{s.label}</span>
              </li>
            ))}
          </ul>

          {igUrl && (
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ps-apresentacao-social"
              aria-label={`Instagram ${igHandle}`}
            >
              <InstagramIcon />
              <span>{igHandle}</span>
            </a>
          )}
        </div>

        <div className="ps-apresentacao-visual fade-up">
          <figure className="ps-apresentacao-frame">
            <img
              src={content.photoUrl}
              alt="Priscila Sinópolis"
              loading="eager"
              width={780}
              height={1040}
            />
            <span className="ps-apresentacao-frame-tag">JFV</span>
          </figure>
        </div>
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
