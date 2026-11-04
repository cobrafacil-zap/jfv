"use client";

import { useEffect, useRef } from "react";

/**
 * Camada ambiente de "LEDs" da landing.
 *
 * - Feixes de luz atravessam a tela continuamente.
 * - Um brilho suave segue o mouse.
 * - Ao clicar/arrastar, o brilho intensifica e um pulso nasce no ponto.
 *
 * Tudo é decorativo (`aria-hidden`) e usa apenas transform/opacity.
 */
export function LedAmbience() {
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;

    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let quadro = 0;

    const mover = (event: PointerEvent) => {
      if (quadro) return;
      quadro = window.requestAnimationFrame(() => {
        quadro = 0;
        raiz.style.setProperty("--led-x", `${event.clientX}px`);
        raiz.style.setProperty("--led-y", `${event.clientY}px`);
        raiz.classList.add("is-active");
      });
    };

    const sair = () => raiz.classList.remove("is-active");

    const pressionar = (event: PointerEvent) => {
      raiz.classList.add("is-dragging");
      raiz.style.setProperty("--led-x", `${event.clientX}px`);
      raiz.style.setProperty("--led-y", `${event.clientY}px`);

      if (reduzirMovimento) return;

      const pulso = document.createElement("span");
      pulso.className = "ps-led-pulse";
      pulso.style.left = `${event.clientX}px`;
      pulso.style.top = `${event.clientY}px`;
      pulso.addEventListener("animationend", () => pulso.remove(), { once: true });
      raiz.appendChild(pulso);
    };

    const soltar = () => raiz.classList.remove("is-dragging");

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", pressionar, { passive: true });
    window.addEventListener("pointerup", soltar, { passive: true });
    window.addEventListener("pointercancel", soltar, { passive: true });
    document.addEventListener("mouseleave", sair);

    return () => {
      if (quadro) window.cancelAnimationFrame(quadro);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", pressionar);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
      document.removeEventListener("mouseleave", sair);
    };
  }, []);

  return (
    <div className="ps-led" ref={raizRef} aria-hidden="true">
      <span className="ps-led-spot" />
      <span className="ps-led-beam ps-led-beam--a" />
      <span className="ps-led-beam ps-led-beam--b" />
      <span className="ps-led-beam ps-led-beam--c" />
      <span className="ps-led-beam ps-led-beam--d" />
      <span className="ps-led-beam ps-led-beam--e" />
    </div>
  );
}
