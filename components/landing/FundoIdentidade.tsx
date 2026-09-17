import type { FundoFotoContent } from "@/lib/landing-content";

/**
 * Fundo e Identidade — foto full-bleed fixa, com overlay escuro,
 * enquanto o conteúdo rola por cima. Reforça a identidade da Priscila
 * sem competir com a hierarquia visual das seções.
 */
export function FundoIdentidade({ content }: { content: FundoFotoContent }) {
  return (
    <div
      className="ps-fundo"
      aria-hidden
      style={{ backgroundImage: `url(${content.url})` }}
    />
  );
}
