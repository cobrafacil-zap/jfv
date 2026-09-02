// Validação de CPF e helper pra MP

export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;

  // Elimina CPFs inválidos conhecidos (todos zeros, sequências, etc)
  if (/^(\d)\1+$/.test(clean)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;

  return true;
}

// CPF padrão pra testes do Mercado Pago
export const TEST_CPF = "12345678909";

/**
 * Em ambiente de TESTE do MP, usa CPF de teste se o CPF do cliente for inválido.
 * Em PRODUÇÃO, retorna o CPF original (assume que passou pela validação).
 */
export function getCPFForMP(cpf: string, isTestMode: boolean = true): string {
  const clean = cpf.replace(/\D/g, "");

  if (isValidCPF(clean)) {
    return clean;
  }

  if (isTestMode) {
    console.warn(
      `[CPF] CPF inválido em modo teste, usando CPF de teste: ${TEST_CPF}`
    );
    return TEST_CPF;
  }

  return clean; // produção: deixa o MP rejeitar
}