"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/** Ativa efeitos avançados apenas quando o usuário NÃO é touch. */
function isPointerFine() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** Efeito magnético sutil em botões — só em dispositivos com mouse. */
export function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isPointerFine()) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}

/** Tilt 3D sutil em cards — desativado em touch. */
export function useTilt<T extends HTMLElement>(max = 8) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isPointerFine()) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * max;
      const ry = (x - 0.5) * max;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const onLeave = () => {
      el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [max]);

  return ref;
}

/** Revela elementos em sequência (stagger) com IntersectionObserver. */
export function useStaggerReveal(selector: string, staggerMs = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll(selector));
    if (!items.length) return;

    items.forEach((el) => (el as HTMLElement).style.transitionDelay = "0ms");

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setReady(true);
          items.forEach((el, i) => {
            (el as HTMLElement).style.transitionDelay = `${i * staggerMs}ms`;
            el.classList.add("visible");
          });
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    io.observe(root);
    return () => io.disconnect();
  }, [selector, staggerMs]);

  return { ref, ready };
}

/** Parallax sutil no scroll. */
export function useParallax<T extends HTMLElement>(speed = 0.08) {
  const ref = useRef<T>(null);
  const raf = useRef<number>(0);
  const lastY = useRef(0);

  const tick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = rect.top * speed;
    el.style.setProperty("--parallax", `${offset}px`);
    raf.current = 0;
  }, [speed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        lastY.current = window.scrollY;
        tick();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [tick]);

  return ref;
}
