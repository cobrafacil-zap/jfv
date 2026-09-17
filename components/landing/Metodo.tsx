"use client";

import { useEffect, useRef } from "react";
import type { MetodoContent } from "@/lib/landing-content";

/**
 * Método JFV — quatro passos em fluxo horizontal.
 * Posicionar → Atrair → Vender → Escalar.
 */
export function Metodo({ content }: { content: MetodoContent }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(".ps-mstep"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="ps-metodo" ref={sectionRef} id="metodo">
      <div className="ps-metodo-inner">
        <header className="ps-sh ps-sh--center fade-up">
          <div className="ps-sh-eyebrow">{content.eyebrow}</div>
          <h2 className="ps-sh-title">{content.title}</h2>
          <p className="ps-sh-sub">{content.sub}</p>
        </header>

        <ol className="ps-metodo-flow">
          {content.steps.map((step, i) => (
            <li key={i} className="ps-mstep">
              <div className="ps-mstep-head">
                <span className="ps-mstep-num">{step.num}</span>
                <h3 className="ps-mstep-name">{step.name}</h3>
              </div>
              <p className="ps-mstep-desc">{step.desc}</p>
              {i < content.steps.length - 1 && (
                <span className="ps-mstep-arrow" aria-hidden>
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
