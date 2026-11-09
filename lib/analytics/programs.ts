export type KnownProgram = { id: string; name: string };

/**
 * Programas exibidos na landing. A lista serve para o painel mostrar
 * também os programas que ainda não receberam nenhum clique.
 * Programas novos aparecem automaticamente a partir dos eventos.
 */
export const KNOWN_PROGRAMS: KnownProgram[] = [
  { id: "jfv-assinatura", name: "Jeito Fácil de Vender" },
  { id: "zero-10k", name: "Do Zero aos 10k" },
  { id: "empresas-aceleracao", name: "Aceleração Comercial" },
];
