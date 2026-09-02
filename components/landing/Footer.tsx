import type { FooterContent } from "@/lib/landing-content";

export function Footer({ content }: { content: FooterContent }) {
  const isExternal = (href: string) => href.startsWith("http");
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="footer-brand-name">{content.brandName}</div>
          <div className="footer-brand-sub">{content.brandSub}</div>
          <p className="footer-desc">{content.desc}</p>
          <div className="social-links">
            {content.socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="social-link"
                title={s.title}
                target={isExternal(s.href) ? "_blank" : undefined}
                rel={isExternal(s.href) ? "noopener noreferrer" : undefined}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        {content.columns.map((col, i) => (
          <div className="footer-col" key={i}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l, j) => (
                <li key={j}>
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
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">{content.copy}</span>
        <span className="footer-method">{content.method}</span>
      </div>
    </footer>
  );
}