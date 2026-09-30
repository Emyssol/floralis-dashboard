// Teto de missões semanais por guilda — Matriz (Floralis) usa 24, Baby usa
// 18. Módulo puro (sem "use client", sem imports de React/next-auth) pra
// poder ser usado tanto no client quanto em rotas de API no servidor.
export const MISSOES_MAX_MATRIZ = 24
export const MISSOES_MAX_BABY = 18

// Mesmo critério de sempre pra reconhecer a guilda Baby a partir de uma
// string livre (aceita "Floralis Baby", "🧸 Floralis Baby", etc.).
export function isBabyGuildString(guild?: string | null): boolean {
  return (guild ?? "").toLowerCase().includes("baby")
}

export function getMissoesMax(guild?: string | null): number {
  return isBabyGuildString(guild) ? MISSOES_MAX_BABY : MISSOES_MAX_MATRIZ
}
