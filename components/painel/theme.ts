"use client";

import { useState } from "react";
import { useEffect } from "react";

export type PainelTheme = "light" | "dark";

const STORAGE_KEY = "painel-theme";

export function usePainelTheme() {
  const [theme, setTheme] = useState<PainelTheme>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // mantém o padrão claro
    }
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next: PainelTheme = current === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignora armazenamento indisponível
      }
      return next;
    });
  };

  return { theme, toggleTheme };
}
