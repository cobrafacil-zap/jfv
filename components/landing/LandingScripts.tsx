"use client";

import { useEffect } from "react";

/**
 * Interatividade leve da landing pública.
 *  - IntersectionObserver para .fade-up
 * Mantém escopo isolado em .ps-landing.
 */
export function LandingScripts() {
  useEffect(() => {
    const root = document.querySelector(".ps-landing");
    if (!root) return;

    // Reveal .fade-up ao entrar na viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.closest("section");
            const items = section
              ? Array.from(section.querySelectorAll(".fade-up:not(.is-visible)"))
              : [entry.target];
            items.forEach((el, i) => {
              const delay =
                (el as HTMLElement).style.transitionDelay || `${i * 80}ms`;
              (el as HTMLElement).style.transitionDelay = delay;
              el.classList.add("is-visible");
            });
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    root.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}