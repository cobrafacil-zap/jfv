import type { ApresentacaoContent } from "@/lib/landing-content";

/**
 * Hero — composição compacta, foco na mensagem (badge, nome, frase, botões, provas).
 * Sem card de foto grande; avatar pequeno integrado ao nome.
 * Decoração 3D discreta (gráfico translúcido, esferas, cards de métrica, linhas).
 */
export function Apresentacao({ content }: { content: ApresentacaoContent }) {
  const isExternal = (href: string) => /^https?:\/\//.test(href);
  const igHandle = content.instagramHandle || "";
  const igUrl = igHandle
    ? `https://www.instagram.com/${igHandle.replace(/^@/, "")}/`
    : null;

  return (
    <section className="ps-apresentacao" id="apresentacao">
      {/* Camada decorativa 3D */}
      <div className="ps-3d" aria-hidden>
        <svg
          className="ps-3d-chart"
          viewBox="0 0 320 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="psChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgb(196 78 35 / 0.28)" />
              <stop offset="1" stopColor="rgb(196 78 35 / 0)" />
            </linearGradient>
          </defs>
          <path
            d="M8 160 L70 128 L128 138 L186 84 L246 96 L312 28 L312 172 L8 172 Z"
            fill="url(#psChartFill)"
          />
          <path
            d="M8 160 L70 128 L128 138 L186 84 L246 96 L312 28"
            stroke="rgb(232 142 88 / 0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="312" cy="28" r="5" fill="rgb(232 142 88)" />
        </svg>

        <div className="ps-3d-sphere ps-3d-sphere--a" />
        <div className="ps-3d-sphere ps-3d-sphere--b" />
        <div className="ps-3d-sphere ps-3d-sphere--c" />
        <div className="ps-3d-line ps-3d-line--a" />
        <div className="ps-3d-line ps-3d-line--b" />
      </div>

      <div className="ps-apresentacao-inner">
        <div className="ps-apresentacao-text fade-up">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>

          <div className="ps-apresentacao-name-row">
            {content.photoUrl && (
              <img
                src={content.photoUrl}
                alt={`Foto de ${content.name}`}
                className="ps-apresentacao-avatar"
                width={88}
                height={88}
              />
            )}
            <div>
              <h1 className="ps-apresentacao-name">{content.name}</h1>
              <span className="ps-apresentacao-method">{content.method}</span>
            </div>
          </div>

          <p className="ps-apresentacao-tagline">
            {content.tagline.replace(/\.$/, "")}<em>.</em>
          </p>

          <p className="ps-apresentacao-sub">{content.sub}</p>

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

        <div className="ps-apresentacao-visual fade-up" aria-hidden>
          <div className="ps-hero-glow" />

          <figure className="ps-hero-photo-card">
            {content.photoUrl && (
              <img
                src={content.photoUrl}
                alt=""
                className="ps-hero-photo"
                width={400}
                height={500}
              />
            )}
            <figcaption className="ps-hero-photo-caption">
              <span className="ps-hero-chip">{content.method}</span>
              <span className="ps-hero-photo-name">{content.name}</span>
            </figcaption>
          </figure>

          <div className="ps-3d-card ps-3d-card--a">
            <span>Conversão</span>
            <strong>+32%</strong>
          </div>
          <div className="ps-3d-card ps-3d-card--b">
            <span>Pipeline ativo</span>
            <strong>1.4k leads</strong>
          </div>
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
