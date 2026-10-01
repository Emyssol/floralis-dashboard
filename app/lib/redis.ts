import { Redis } from "@upstash/redis"

// Estado semanal de "concluí minhas missões" — dado temporário que reseta toda
// semana, então fica no Redis (Upstash, via Vercel Marketplace) em vez do Notion.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN!,
})

// Hash com o progresso semanal de missões por florista: campo = florista_id,
// valor = contador inteiro 0..24. Mesma chave e mesmo padrão de reset semanal
// de quando isso era um set booleano (redis.del zera todo mundo de uma vez,
// igual antes) — só o tipo do valor mudou.
export const MISSOES_CONCLUIDAS_KEY = "missoes:concluidas"

// Hash global de "pontos extras" por par (florista, flor). Cada campo é
// `${florista_id}::${flower_name}` e o valor é "1".."4". SEM TTL e SEM job de
// limpeza — é permanente por design, só muda quando a própria florista altera
// ou remove. hset de 1 campo = escrita atômica por par; hgetall = leitura de
// tudo de uma vez pro dashboard.
export const PONTOS_EXTRA_KEY = "pontos-extra"
