"use client";

import { useEffect, useRef, useState } from "react";
import type { MetodoStep } from "@/lib/landing-content";

/**
 * MethodStep — passo do Método JFV.
 * Entrada via IntersectionObserver. Linha vertical comum entre passos.
 */
export function MethodStep({
  step,
  index,
  total,
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

  const isLast = index === total - 1;

  return (
    <div
      ref={ref}
      className={`ps-mstep${visible ? " is-visible" : ""}`}
      data-index={index}
    >
      <div className="ps-mstep-rail">
        <div className="ps-mstep-dot">
          <span>{step.num}</span>
        </div>
        {!isLast && <div className="ps-mstep-line" aria-hidden />}
      </div>

      <div className="ps-mstep-body">
        <span className="ps-mstep-num">PASSO {step.num}</span>
        <h3 className="ps-mstep-name">{step.name}</h3>
        <p className="ps-mstep-desc">{step.desc}</p>
      </div>
    </div>
  );
}