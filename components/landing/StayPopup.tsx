"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_URL =
  "https://wa.me/5543996820296?text=Ol%C3%A1%2C%20Priscila!%20Cheguei%20no%20fim%20do%20site%20e%20quero%20conversar%20sobre%20os%20programas%20antes%20de%20ir.";

const CHAVE_SESSAO = "jfv-stay-popup";

/**
 * Popup de retenção — aparece quando a pessoa chega ao fim da página,
 * tentando conduzi-la para uma conversa antes de sair.
 * Mostra uma única vez por sessão.
 */
export function StayPopup() {
  const [aberto, setAberto] = useState(false);
  const disparado = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(CHAVE_SESSAO)) return;

    const tentarDisparar = () => {
      if (disparado.current) return;
      const fimDaPagina =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 320;
      if (fimDaPagina) {
        disparado.current = true;
        sessionStorage.setItem(CHAVE_SESSAO, "1");
        window.removeEventListener("scroll", tentarDisparar);
        // pequena pausa para a pessoa perceber o rodapé antes do popup
        setTimeout(() => setAberto(true), 700);
      }
    };

    window.addEventListener("scroll", tentarDisparar, { passive: true });
    window.addEventListener("resize", tentarDisparar);
    // cobre abertura já no fim (restauração de rolagem) e layout que carrega depois
    const t1 = setTimeout(tentarDisparar, 1200);
    const t2 = setTimeout(tentarDisparar, 3000);

    return () => {
      window.removeEventListener("scroll", tentarDisparar);
      window.removeEventListener("resize", tentarDisparar);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
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
      <div className="ps-stay-card">
        <button
          type="button"
          className="ps-stay-close"
          aria-label="Fechar"
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
