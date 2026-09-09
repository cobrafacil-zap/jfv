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
        <aside className="ps-metodo-aside">
          <div className="ps-sh">
            <div className="ps-sh-eyebrow">{content.eyebrow}</div>
            <h2 className="ps-sh-title">{content.stickyTitle}</h2>
            <p className="ps-metodo-aside-text">{content.stickySub}</p>
          </div>

          <div className="ps-metodo-aside-meta">
            <span className="ps-metodo-aside-tag">Sistema proprietário</span>
            <span className="ps-metodo-aside-line" aria-hidden />
            <span className="ps-metodo-aside-step">{content.steps.length} movimentos</span>
          </div>
        </aside>

        <div className="ps-metodo-timeline">
          {content.steps.map((s, i) => (
            <MethodStep key={s.num} step={s} index={i} total={content.steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
