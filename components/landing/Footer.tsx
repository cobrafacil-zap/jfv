import type { FooterContent } from "@/lib/landing-content";

export function Footer({ content }: { content: FooterContent }) {
  const isExternal = (href: string) => href.startsWith("http");
  return (
    <footer className="ps-footer">
      <div className="ps-footer-inner">
        <div className="ps-footer-brand">
          <div className="ps-footer-name">{content.brand}</div>
          <div className="ps-footer-method">{content.method}</div>
          <p className="ps-footer-tagline">{content.tagline}</p>

          <ul className="ps-footer-socials" aria-label="Redes sociais">
            {content.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {content.columns.map((col) => (
          <div className="ps-footer-col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={isExternal(l.href) ? "_blank" : undefined}
                    rel={isExternal(l.href) ? "noopener noreferrer" : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="ps-footer-col">
          <h4>Legal</h4>
          <ul>
            {content.legal.map((l) => (
              <li key={l}>
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ps-footer-bottom">
        <span>{content.copyright}</span>
        <span className="ps-footer-bottom-tag">{content.method}</span>
      </div>
    </footer>
  );
}