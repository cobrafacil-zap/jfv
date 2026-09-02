"use client";

import { useEffect, useRef, useState } from "react";
import type { StatsContent } from "@/lib/landing-content";

/** Conta de 0 até o valor numérico quando a faixa entra na viewport. */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

function parseNum(raw: string) {
  const m = /^([^0-9]*)(\d+)(.*)$/.exec(raw);
  if (!m) return null;
  return { prefix: m[1], num: parseInt(m[2], 10), suffix: m[3] };
}

function Stat({ raw, active }: { raw: string; active: boolean }) {
  const parsed = parseNum(raw);
  const count = useCountUp(parsed?.num ?? 0, active && !!parsed);
  return (
    <span className="stat-num">
      {parsed ? `${parsed.prefix}${count}${parsed.suffix}` : raw}
    </span>
  );
}

export function Stats({ content }: { content: StatsContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div id="stats" ref={ref}>
      <div className="stats-inner">
        {content.items.map((s, i) => (
          <div className="stat-item" key={i}>
            <Stat raw={s.num} active={active} />
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}