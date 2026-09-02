import type { NavContent } from "@/lib/landing-content";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar({ content }: { content: NavContent }) {
  const isExternal = (href: string) => href.startsWith("http");
  return (
    <nav className="ps-nav">
      <div className="nav-logo">
        {content.logoStart}
        <span>{content.logoHighlight}</span>
      </div>
      <ul className="nav-links" id="navLinks">
        {content.links.map((l, i) => (
          <li key={i}>
            <a
              href={l.href}
              target={isExternal(l.href) ? "_blank" : undefined}
              rel={isExternal(l.href) ? "noopener noreferrer" : undefined}
            >
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href={content.cta.href}
            className="nav-cta"
            target={isExternal(content.cta.href) ? "_blank" : undefined}
            rel={isExternal(content.cta.href) ? "noopener noreferrer" : undefined}
          >
            {content.cta.label}
          </a>
        </li>
      </ul>
      <div className="nav-actions">
        <ThemeToggle variant="landing" />
        <button className="hamburger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}