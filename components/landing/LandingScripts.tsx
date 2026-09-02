"use client";

import { useEffect, useRef } from "react";

/**
 * Interatividade leve da landing pública:
 *  - IntersectionObserver para .fade-up (animação de scroll escalonada)
 *  - toggle do menu hamburger no mobile
 *  - sombra do nav ao rolar
 *  - cursor customizado (desktop only)
 * Tudo via querySelector dentro de .ps-landing (escopo isolado).
 */
export function LandingScripts() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.querySelector(".ps-landing");
    if (!root) return;

    // Fade-up animation com stagger automático dentro de cada seção
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.closest("section, #stats");
            const items = section
              ? Array.from(section.querySelectorAll(".fade-up:not(.visible)"))
              : [entry.target];
            items.forEach((el, i) => {
              const delay = (el as HTMLElement).style.transitionDelay || `${i * 70}ms`;
              (el as HTMLElement).style.transitionDelay = delay;
              el.classList.add("visible");
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
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

    // Cursor customizado sutil (apenas desktop com mouse)
    const isFine = window.matchMedia("(pointer: fine)").matches;
    let cursor: HTMLDivElement | null = null;
    if (isFine) {
      cursor = document.createElement("div");
      cursor.className = "landing-cursor";
      cursorRef.current = cursor;
      document.body.appendChild(cursor);

      let cx = window.innerWidth / 2;
      let cy = window.innerHeight / 2;
      let tx = cx;
      let ty = cy;
      let raf = 0;

      const move = () => {
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        if (cursor) {
          cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        }
        raf = requestAnimationFrame(move);
      };

      const onMouseMove = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
      };

      const onHoverStart = () => cursor?.classList.add("hover");
      const onHoverEnd = () => cursor?.classList.remove("hover");

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      raf = requestAnimationFrame(move);

      root.querySelectorAll("a, button, .card, .depo-card, .faq-q, .tag").forEach((el) => {
        el.addEventListener("mouseenter", onHoverStart);
        el.addEventListener("mouseleave", onHoverEnd);
      });

      return () => {
        observer.disconnect();
        hamburger?.removeEventListener("click", toggle);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(raf);
        cursor?.remove();
      };
    }

    return () => {
      observer.disconnect();
      hamburger?.removeEventListener("click", toggle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
