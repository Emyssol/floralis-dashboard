import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Checagem leve e otimista: só confere se o COOKIE de sessão existe.
// A validação de verdade (assinatura do JWT, cargo, permissões) acontece
// nas Server Components (ex: page.tsx) e nas rotas de API — nunca aqui.
// Next.js 16 não recomenda mais usar auth()/consultas pesadas dentro do proxy
// (o antigo padrão "export { auth as middleware }" causa um loop de
// login/logout, porque o cookie recém-criado nem sempre é reconhecido
// corretamente nessa camada de rede).
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token")

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Protege tudo, exceto:
// - rotas do próprio NextAuth (/api/auth/*) — senão o login nunca completaria
// - a própria página /login — senão vira loop de redirecionamento
// - arquivos estáticos (manifest, ícones, imagens, etc — qualquer path com extensão)
// - internals do Next.js (_next)
export const config = {
  matcher: ["/((?!api/auth|login|_next|.*\\..*).*)"],
}