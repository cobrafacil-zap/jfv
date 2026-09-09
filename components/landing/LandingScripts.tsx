"use client";

import { useEffect } from "react";

/**
 * Interatividade leve da landing pública:
 *  - IntersectionObserver para .fade-up (animação de scroll escalonada)
 *  - toggle do menu hamburger no mobile
 *  - sombra do nav ao rolar
 * Tudo via querySelector dentro de .ps-landing (escopo isolado).
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

    // Nav hamburger (mobile)
    const nav = root.querySelector(".ps-nav");
    const navLinks = root.querySelector(".nav-links") as HTMLElement | null;
    const hamburger = root.querySelector(".hamburger") as HTMLButtonElement | null;
    const toggle = () => navLinks?.classList.toggle("open");
    hamburger?.addEventListener("click", toggle);
    navLinks?.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks?.classList.remove("open"))
    );

    // Sombra do nav ao rolar
    const onScroll = () => {
      if (nav) {
        (nav as HTMLElement).classList.toggle("scrolled", window.scrollY > 40);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      hamburger?.removeEventListener("click", toggle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}