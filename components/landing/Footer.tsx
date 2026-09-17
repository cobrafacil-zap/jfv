import type { FooterContent } from "@/lib/landing-content";

/**
 * Footer — versão minimalista personal-brand.
 * Marca + método + tagline + socials + copyright. Sem colunas.
 */
export function Footer({ content }: { content: FooterContent }) {
  const isExternal = (href: string) => href.startsWith("http");
  return (
    <footer className="ps-footer">
      <div className="ps-footer-inner">
        <div className="ps-footer-brand-block">
          <div className="ps-footer-brand">{content.brand}</div>
          <div className="ps-footer-method">{content.method}</div>
          <p className="ps-footer-tagline">{content.tagline}</p>
        </div>

        <ul className="ps-footer-socials" aria-label="Redes sociais">
          {content.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target={isExternal(s.href) ? "_blank" : undefined}
                rel={isExternal(s.href) ? "noopener noreferrer" : undefined}
                className="ps-footer-social"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ps-footer-bottom">
          <p className="ps-footer-copy">{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
