"use client";

import { useState } from "react";
import type { FaqContent } from "@/lib/landing-content";

export function FAQ({ content }: { content: FaqContent }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq">
      <div className="container">
        <div className="resultados-header" style={{ marginBottom: 40 }}>
          <div className="section-eyebrow eyebrow-center">Dúvidas frequentes</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Perguntas frequentes
          </h2>
        </div>

        <div className="faq-list">
          {content.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item${isOpen ? " open" : ""}`} key={i}>
                <button
                  className="faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}