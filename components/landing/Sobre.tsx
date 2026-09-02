"use client";

import { useRef } from "react";
import type { SobreContent } from "@/lib/landing-content";
import { RichText } from "./RichText";
import { useTilt } from "./use-landing-effects";

function TiltImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useTilt<HTMLDivElement>(5);
  return (
    <div ref={ref} className={className} style={{ ...style, transition: "transform 0.25s ease" }}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

export function Sobre({ content }: { content: SobreContent }) {
  return (
    <section id="sobre" className="stagger-section">
      <div className="container">
        <div className="sobre-grid">
          <div style={{ position: "relative" }}>
            <div className="mosaic-accent" />
            <div className="sobre-mosaic">
              <TiltImage className="mosaic-main" src={content.photoMain} alt="Priscila Sinópolis" />
              <TiltImage
                className="mosaic-sm"
                src={content.photoSm1}
                alt="Priscila Sinópolis"
                style={{ objectPosition: "center 20%" }}
              />
              <TiltImage
                className="mosaic-sm"
                src={content.photoSm2}
                alt="Priscila Sinópolis gravando conteúdo"
              />
            </div>
          </div>
          <div className="sobre-text">
            <div className="section-eyebrow fade-up">{content.eyebrow}</div>
            <h2 className="section-title fade-up" style={{ transitionDelay: "80ms" }}>
              {content.title}
            </h2>
            {content.paragraphs.map((p, i) => (
              <p key={i} className="fade-up" style={{ transitionDelay: `${160 + i * 80}ms` }}>
                <RichText text={p} />
              </p>
            ))}
            <div className="sobre-tags fade-up" style={{ transitionDelay: "320ms" }}>
              {content.tags.map((t, i) => (
                <span className="tag" key={i} style={{ transitionDelay: `${320 + i * 60}ms` }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
