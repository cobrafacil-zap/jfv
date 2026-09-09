"use client";

import { useState } from "react";
import type { FaqContent } from "@/lib/landing-content";

/**
 * FAQ — accordion elegante + CTA ao final.
 */
export function FAQ({ content }: { content: FaqContent }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="ps-faq" id="faq">
      <div className="ps-faq-inner">
        <header className="ps-sh tone-center">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">{content.title}</h2>
        </header>

        <div className="ps-faq-list">
          {content.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`ps-faq-item${isOpen ? " is-open" : ""}`} key={i}>
                <button
                  className="ps-faq-q"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`ps-faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="ps-faq-icon" aria-hidden>
                    +
                  </span>
                </button>
                <div
                  id={`ps-faq-a-${i}`}
                  className="ps-faq-a"
                  role="region"
                  aria-hidden={!isOpen}
                >
                  <div className="ps-faq-a-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {content.ctaText && content.ctaLabel && (
          <div className="ps-faq-cta">
            <p className="ps-faq-cta-text">{content.ctaText}</p>
            <a
              className="ps-btn ps-btn--ghost"
              href={content.ctaHref}
              target={content.ctaHref?.startsWith("http") ? "_blank" : undefined}
              rel={content.ctaHref?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {content.ctaLabel} →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
