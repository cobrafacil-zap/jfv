/**
 * SectionHeading — título editorial reutilizável.
 * Tipografia display (Playfair) + eyebrow com tracinho roxo.
 * Variações: `tone="dark"` para fundos escuros.
 */
import type { ReactNode } from "react";

type Tone = "light" | "dark";

export function SectionHeading({
  eyebrow,
  title,
  titleEm,
  sub,
  align = "left",
  tone = "light",
  children,
}: {
  eyebrow?: string;
  title?: ReactNode;
  titleEm?: ReactNode;
  sub?: ReactNode;
  align?: "left" | "center";
  tone?: Tone;
  children?: ReactNode;
}) {
  const isCenter = align === "center";
  const wrapClass = `ps-sh ${isCenter ? "ps-sh-center" : ""} tone-${tone}`;

  return (
    <header className={wrapClass}>
      {eyebrow && <div className="ps-sh-eyebrow">{eyebrow}</div>}
      {title && (
        <h2 className="ps-sh-title">
          {title}
          {titleEm && <> <em>{titleEm}</em></>}
        </h2>
      )}
      {sub && <p className="ps-sh-sub">{sub}</p>}
      {children}
    </header>
  );
}