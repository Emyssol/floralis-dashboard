# Floralis Dashboard

Dashboard da guilda **Floralis** (de um jogo), com catálogo de flores e membros (floristas). Os dados vêm de bancos do [Notion](https://www.notion.so/) e o login é feito com Google. O projeto é hospedado na [Vercel](https://vercel.com/).

> 🆕 **Nova por aqui?** Antes de mexer no código, dá uma olhada em [`docs/onboarding-estrutura.md`](docs/onboarding-estrutura.md) — é um mapa completo da estrutura de pastas do projeto, explicando o que cada uma guarda e por quê, incluindo os arquivos "especiais" do Next.js (`page.tsx`, `layout.tsx`, `proxy.ts` etc.) e uma lista de componentes que existem no código mas não são usados hoje (pra você não perder tempo tentando entender pra que servem).

> ⚠️ **Atenção, versão do Next.js:** este projeto usa o **Next.js 16**, que trouxe mudanças relevantes em relação a versões mais antigas (o arquivo `proxy.ts`, por exemplo, substitui o antigo `middleware.ts`). Se algo aqui parecer diferente do que você já viu em tutoriais ou em outros projetos Next.js, consulte a documentação em `node_modules/next/dist/docs/` antes de assumir que é um erro — veja também o `AGENTS.md` na raiz do projeto.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** para estilos
- **@notionhq/client** para ler/escrever nos bancos do Notion
- **Auth.js v5** (NextAuth) com login via Google
- **framer-motion** para animações

## Como rodar localmente

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (ele não é versionado no Git) com as seguintes chaves:

```bash
NOTION_TOKEN=            # token de integração do Notion
NOTION_FLOWERS_DB=       # ID do banco de flores no Notion
NOTION_MEMBERS_DB=       # ID do banco de floristas/membros no Notion
NOTION_SOLICITACOES_DB=  # ID do banco de solicitações no Notion
AUTH_GOOGLE_ID=          # Client ID do OAuth do Google
AUTH_GOOGLE_SECRET=      # Client Secret do OAuth do Google
AUTH_SECRET=             # segredo usado pelo Auth.js para assinar sessões
```

Peça esses valores a alguém da equipe — eles não devem ser compartilhados publicamente nem commitados.

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para ver o resultado. A tela inicial (`app/page.tsx`) exige login — sem sessão válida, você é redirecionado para `/login`.

### Outros comandos úteis

```bash
npm run build   # gera a versão de produção
npm run start   # roda a versão de produção já buildada
npm run lint    # verifica o código com o ESLint
```

## Onde encontrar as coisas

Para uma explicação completa da estrutura de pastas (o que é `app/api/`, `app/components/`, `app/lib/`, os arquivos especiais do App Router, os arquivos de configuração da raiz e os componentes órfãos), veja [`docs/onboarding-estrutura.md`](docs/onboarding-estrutura.md).

## Deploy

O deploy é feito na [Vercel](https://vercel.com/). Para detalhes gerais sobre deploy de projetos Next.js, veja a [documentação oficial](https://nextjs.org/docs/app/building-your-application/deploying).

## Saiba mais sobre o Next.js

- [Next.js Documentation](https://nextjs.org/docs) — funcionalidades e API do framework.
- [Learn Next.js](https://nextjs.org/learn) — tutorial interativo.

Como este projeto usa o Next.js 16, prefira consultar a documentação local em `node_modules/next/dist/docs/` para conferir se alguma convenção mudou em relação ao que está descrito nos links acima.
