"use client";

import { useEffect, useRef, useState } from "react";
import type { MetodoStep } from "@/lib/landing-content";

/**
 * MethodStep — passo do Método JFV.
 * Entrada via IntersectionObserver.
 */
export function MethodStep({
  step,
  index: _index,
  total: _total,
}: {
  step: MetodoStep;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`ps-mstep${visible ? " is-visible" : ""}`}
    >
      <span className="ps-mstep-num">{step.num}</span>
      <div>
        <h3 className="ps-mstep-name">{step.name}</h3>
        <p className="ps-mstep-desc">{step.desc}</p>
      </div>
    </div>
  );
}
