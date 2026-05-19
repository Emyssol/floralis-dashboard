/**
 * As URLs do Notion (AWS S3) são assinadas e só funcionam carregadas
 * diretamente pelo browser — o proxy server-side causa 404 da AWS.
 * Esta função retorna a URL original sem modificação.
 */
export function proxyImage(url: string | null): string | null {
  return url ?? null
}