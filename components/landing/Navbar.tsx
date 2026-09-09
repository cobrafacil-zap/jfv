"use client";

import { useEffect, useState } from "react";
import type { NavContent } from "@/lib/landing-content";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Navbar — header premium, sticky, com blur ao rolar.
 */
export function Navbar({ content }: { content: NavContent }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isExternal = (href: string) => href.startsWith("http");

  return (
    <header className={`ps-nav${scrolled ? " is-scrolled" : ""}`}>
      <a href="#hero" className="ps-nav-brand" aria-label="Priscila Sinópolis">
        {content.brand}
      </a>

      <nav className={`ps-nav-links${open ? " is-open" : ""}`} aria-label="Navegação principal">
        {content.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target={isExternal(l.href) ? "_blank" : undefined}
            rel={isExternal(l.href) ? "noopener noreferrer" : undefined}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </a>
        ))}
        <a
          href={content.cta.href}
          target={isExternal(content.cta.href) ? "_blank" : undefined}
          rel={isExternal(content.cta.href) ? "noopener noreferrer" : undefined}
          className="ps-nav-cta"
          onClick={() => setOpen(false)}
        >
          {content.cta.label}
        </a>
      </nav>

      <div className="ps-nav-actions">
        <ThemeToggle variant="landing" />
        <button
          type="button"
          className={`ps-nav-burger${open ? " is-open" : ""}`}
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}