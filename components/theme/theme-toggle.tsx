"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  /** Variante visual — "landing" usa classes do CSS scoped; "ghost" usa Tailwind tokens. */
  variant?: "ghost" | "landing";
  className?: string;
}

export function ThemeToggle({ variant = "ghost", className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  if (variant === "landing") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo noturno"}
        title={isDark ? "Modo claro" : "Modo noturno"}
        className={`theme-toggle ${className ?? ""}`}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo noturno"}
      title={isDark ? "Modo claro" : "Modo noturno"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-card text-text-secondary transition-colors hover:border-accent hover:text-accent ${className ?? ""}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}