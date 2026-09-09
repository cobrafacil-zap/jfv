"use client";

import type { MetodoContent } from "@/lib/landing-content";
import { MethodStep } from "@/components/ui/MethodStep";

/**
 * Metodo — sticky title lateral (desktop) + etapas verticais com linha de progresso.
 * Mobile vira timeline vertical.
 */
export function Metodo({ content }: { content: MetodoContent }) {
  return (
    <section className="ps-metodo" id="metodo">
      <div className="ps-metodo-inner">
        <aside className="ps-metodo-sticky">
          <div className="ps-sh tone-light">
            <div className="ps-sh-eyebrow">{content.eyebrow}</div>
            <h2 className="ps-metodo-sticky-title">{content.stickyTitle}</h2>
            <p className="ps-metodo-sticky-sub">{content.stickySub}</p>
          </div>

          <div className="ps-metodo-sticky-meta">
            <span className="ps-metodo-sticky-tag">Sistema proprietário</span>
            <span className="ps-metodo-sticky-line" aria-hidden />
            <span className="ps-metodo-sticky-step">{content.steps.length} movimentos</span>
          </div>
        </aside>

        <div className="ps-metodo-track">
          <header className="ps-metodo-header">
            <h3>
              {content.title} <em>{content.sub}</em>
            </h3>
          </header>

          <div className="ps-metodo-steps">
            {content.steps.map((s, i) => (
              <MethodStep key={s.num} step={s} index={i} total={content.steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}