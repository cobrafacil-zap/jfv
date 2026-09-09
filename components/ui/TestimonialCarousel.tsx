"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Depoimento } from "@/lib/landing-content";

/**
 * TestimonialCarousel — carrossel premium com 1 ou 2 cards por vez.
 * Autoplay lento; pausa ao interagir; swipe no touch.
 */
export function TestimonialCarousel({
  items,
}: {
  items: Depoimento[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const total = items.length;
  const goTo = useCallback(
    (idx: number) => {
      const next = ((idx % total) + total) % total;
      setActive(next);
    },
    [total]
  );

  // autoplay
  useEffect(() => {
    if (paused || total < 2) return;
    const t = setInterval(() => {
      setActive((a) => (a + 1) % total);
    }, 7000);
    return () => clearInterval(t);
  }, [paused, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goTo(active + 1);
      else goTo(active - 1);
    }
    touchX.current = null;
  };

  if (!items.length) return null;

  return (
    <div
      className="ps-tcar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="ps-tcar-viewport" ref={trackRef}>
        {items.map((t, i) => (
          <article
            key={i}
            className={`ps-tcard${i === active ? " is-active" : ""}`}
            aria-hidden={i !== active}
          >
            <div className="ps-tcard-mark" aria-hidden>
              &ldquo;
            </div>
            <p className="ps-tcard-phrase">{t.phrase}</p>
            <p className="ps-tcard-text">{t.text}</p>

            <div className="ps-tcard-meta">
              <div className="ps-tcard-author">
                <span className="ps-tcard-name">{t.name}</span>
                <span className="ps-tcard-role">{t.role}</span>
              </div>
              <div className="ps-tcard-side">
                <span className="ps-tcard-product">{t.product}</span>
                <span className="ps-tcard-result">{t.result}</span>
              </div>
            </div>

            {t.isPlaceholder && (
              <div className="ps-tcard-flag" aria-label="Depoimento placeholder">
                Placeholder · aguardando conteúdo real
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="ps-tcar-controls">
        <div className="ps-tcar-dots" role="tablist" aria-label="Selecionar depoimento">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Ir para depoimento ${i + 1}`}
              className={`ps-tcar-dot${i === active ? " is-active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="ps-tcar-nav">
          <span className="ps-tcar-count" aria-live="polite">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="ps-tcar-arrow"
            onClick={() => goTo(active - 1)}
            aria-label="Depoimento anterior"
          >
            ←
          </button>
          <button
            type="button"
            className="ps-tcar-arrow"
            onClick={() => goTo(active + 1)}
            aria-label="Próximo depoimento"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}