"use client";

import { useRef, useEffect } from "react";
import type { HeroContent } from "@/lib/landing-content";
import { useMagnetic } from "./use-landing-effects";

export function Hero({ content }: { content: HeroContent }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const chip1 = useRef<HTMLDivElement>(null);
  const chip2 = useRef<HTMLDivElement>(null);
  const primaryRef = useMagnetic<HTMLAnchorElement>(0.18);
  const secondaryRef = useMagnetic<HTMLAnchorElement>(0.12);

  function onMove(e: React.MouseEvent) {
    const el = visualRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    const px = Math.max(-0.5, Math.min(0.5, nx));
    const py = Math.max(-0.5, Math.min(0.5, ny));
    if (photoRef.current) photoRef.current.style.transform = `translate(${px * -18}px, ${py * -18}px) scale(1.05)`;
    if (chip1.current) chip1.current.style.transform = `translate(${px * 26}px, ${py * 26}px)`;
    if (chip2.current) chip2.current.style.transform = `translate(${px * -30}px, ${py * -22}px)`;
  }

  function onLeave() {
    if (photoRef.current) photoRef.current.style.transform = "";
    if (chip1.current) chip1.current.style.transform = "";
    if (chip2.current) chip2.current.style.transform = "";
  }

  return (
    <section id="hero">
      <div className="hero-visual" ref={visualRef} onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="hero-photo" ref={photoRef} style={{ backgroundImage: `url('${content.photoUrl}')` }} />
        <div className="accent-line" />
        {content.badges[0] && (
          <div className="hero-chip c1" ref={chip1}>
            <span className="dot" />
            {content.badges[0]}
          </div>
        )}
        {content.badges[3] && (
          <div className="hero-chip c2" ref={chip2}>
            <span className="dot" />
            {content.badges[3]}
          </div>
        )}
      </div>
      <div className="hero-content">
        <div className="hero-eyebrow fade-up">{content.eyebrow}</div>
        <h1 className="hero-headline">
          {content.headline.split("\n").map((line, i) => (
            <span key={i} className="fade-up" style={{ display: "block", transitionDelay: `${80 + i * 80}ms` }}>
              {line}
            </span>
          ))}
          {content.headlineEm && (
            <>
              {" "}
              <em className="fade-up" style={{ transitionDelay: `${80 + content.headline.split("\n").length * 80}ms` }}>
                {content.headlineEm.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < content.headlineEm.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </em>
            </>
          )}
        </h1>
        <p className="hero-sub fade-up" style={{ transitionDelay: "300ms" }}>{content.sub}</p>
        <div className="hero-buttons fade-up" style={{ transitionDelay: "380ms" }}>
          <a ref={primaryRef} href={content.primaryCta.href} className="btn-primary magnetic-btn">
            {content.primaryCta.label}
          </a>
          <a ref={secondaryRef} href={content.secondaryCta.href} className="btn-outline magnetic-btn">
            {content.secondaryCta.label}
          </a>
        </div>
        <div className="hero-badges">
          {content.badges.map((b, i) => (
            <div className="badge fade-up" key={i} style={{ transitionDelay: `${460 + i * 70}ms` }}>
              <div className="badge-icon">✓</div>
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
