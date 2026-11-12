"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_URL =
  "https://wa.me/5543996820296?text=Ol%C3%A1%2C%20Priscila!%20Cheguei%20no%20fim%20do%20site%20e%20quero%20conversar%20sobre%20os%20programas%20antes%20de%20ir.";

const CHAVE_SESSAO = "jfv-stay-popup";
/** Dispara depois que a pessoa passou de 65% da página. */
const SCROLL_TRIGGER = 65;
/** Também dispara quando faltam poucos pixels para o fim. */
const NEAR_END = 200;

/**
 * Popup de retenção — aparece quando a pessoa já leu boa parte da página,
 * quando chega ao fim ou quando demonstra intenção de sair.
 * Mostra uma única vez por sessão e prende o foco enquanto está aberto.
 */
export function StayPopup() {
  const [aberto, setAberto] = useState(false);
  const disparado = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(CHAVE_SESSAO)) return;

    const disparar = () => {
      if (disparado.current) return;
      disparado.current = true;
      sessionStorage.setItem(CHAVE_SESSAO, "1");
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      document.removeEventListener("mouseout", aoSair);
      // pequena pausa para a pessoa perceber onde está antes do popup
      setTimeout(() => setAberto(true), 500);
    };

    const aoRolar = () => {
      if (disparado.current) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent =
        ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      const pertoDoFim =
        window.innerHeight + window.scrollY >= doc.scrollHeight - NEAR_END;

      if (percent >= SCROLL_TRIGGER || pertoDoFim) disparar();
    };

    // Exit intent: cursor saindo pelo topo da janela (desktop).
    const aoSair = (event: MouseEvent) => {
      if (event.relatedTarget || event.clientY > 0) return;
      disparar();
    };

    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    document.addEventListener("mouseout", aoSair);
    // cobre abertura já no fim (restauração de rolagem) e layout que carrega depois
    const t1 = setTimeout(aoRolar, 1500);
    const t2 = setTimeout(aoRolar, 4000);

    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      document.removeEventListener("mouseout", aoSair);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!aberto) return;

    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const aoTeclar = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAberto(false);
        return;
      }

      if (event.key !== "Tab") return;

      const card = cardRef.current;
      if (!card) return;

      const focusables = Array.from(
        card.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      className="ps-stay-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ps-stay-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setAberto(false);
      }}
    >
      <div className="ps-stay-card" ref={cardRef}>
        <button
          type="button"
          className="ps-stay-close"
          aria-label="Fechar"
          ref={closeRef}
          onClick={() => setAberto(false)}
        >
          ×
        </button>

        <div className="ps-stay-eyebrow">Antes de ir…</div>

        <h2 id="ps-stay-title" className="ps-stay-title">
          Não saia ainda <em>sem falar comigo.</em>
        </h2>

        <p className="ps-stay-text">
          Se você chegou até aqui, alguma coisa te fez continuar. Antes de fechar
          a aba, me conta qual é o seu momento — pode ser o começo da sua virada
          nas vendas.
        </p>

        <div className="ps-stay-urgency">
          <span className="ps-stay-urgency-dot" aria-hidden />
          Próxima turma com vagas limitadas
        </div>

        <div className="ps-stay-actions">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ps-btn ps-btn--primary ps-stay-cta"
            data-wa-placement="popup-saida"
            onClick={() => setAberto(false)}
          >
            Conversar agora no WhatsApp
            <span aria-hidden>→</span>
          </a>
          <button
            type="button"
            className="ps-btn ps-btn--ghost ps-stay-secondary"
            onClick={() => {
              setAberto(false);
              document
                .querySelector("#programas")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Rever os programas
          </button>
        </div>
      </div>
    </div>
  );
}
