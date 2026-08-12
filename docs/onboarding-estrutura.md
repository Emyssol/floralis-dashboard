# Mapa do projeto — Floralis Dashboard

Bem-vinda(o) ao Floralis! Este guia é o seu "mapa do território": não explica como o código funciona por dentro, só te ajuda a se localizar sozinha(o) na pasta do projeto sem se perder. Guarda esse documento por perto nas primeiras semanas.

Um aviso antes de começar: **este projeto usa o Next.js 16**, uma versão bem recente do framework, e algumas convenções mudaram em relação ao que você encontra em tutoriais mais antigos na internet (o próprio `AGENTS.md` do projeto avisa isso). Então se algo parecer diferente do que você já viu em outro lugar, é bem provável que seja só isso — uma mudança de versão, não um erro.

---

## 1. Árvore de pastas (visão geral)

```
floralis-dashboard/
├── app/                        → todo o código-fonte da aplicação
│   ├── api/                    → rotas de backend (ver seção 2)
│   │   ├── auth/[...nextauth]/
│   │   ├── dashboard/
│   │   ├── flores/
│   │   │   ├── marcar-competicao/
│   │   │   └── marcar-posse/
│   │   └── solicitacoes/
│   ├── components/             → todas as "peças" de tela (~35 arquivos .tsx)
│   ├── lib/                    → funções utilitárias e integrações
│   │   ├── auth.ts
│   │   ├── getDashboardData.ts
│   │   ├── helpers.ts
│   │   ├── imageProxy.ts
│   │   ├── notion.ts
│   │   ├── permissoes.ts
│   │   ├── rarity.ts
│   │   └── types.ts
│   ├── login/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── page.tsx
│   └── providers.tsx
├── public/                     → imagens, ícones e outros arquivos estáticos
├── types/                      → tipos TypeScript globais (ex: next-auth.d.ts)
├── proxy.ts                    → intercepta requisições antes de renderizar (ver seção 3)
├── next.config.ts              → configuração do Next.js
├── package.json                → dependências e scripts do projeto
├── tsconfig.json                → configuração do TypeScript
└── .env.local                  → variáveis de ambiente (chaves secretas, não vai pro Git)
```

Não listei os ~35 arquivos individuais dentro de `app/components/` porque isso deixaria essa árvore gigante demais — são as peças visuais do dashboard (cards de flor, modais, telas de análise, etc.), e a maioria tem nome autoexplicativo.

---

## 2. O que tem dentro de `app/`, pasta por pasta

### `app/api/`
Aqui moram as **rotas de backend** — o código que roda no servidor, não no navegador de quem usa o site. É pra cá que vão as chamadas que precisam falar com o Notion (buscar flores, marcar posse, criar solicitações) ou lidar com login. Cada subpasta vira um endereço de API:

- **`api/auth/[...nextauth]/`** — rota "coringa" que o NextAuth (biblioteca de login) usa para lidar com todo o fluxo de autenticação do Google. Você não vai mexer muito aqui; a lógica de verdade fica em `app/lib/auth.ts`.
- **`api/dashboard/`** — endpoint que devolve os dados prontos do dashboard (flores + floristas), já com cache, pro front-end consumir.
- **`api/flores/marcar-posse/`** e **`api/flores/marcar-competicao/`** — endpoints que atualizam no Notion se uma pessoa tem uma flor ou se ela está valendo pra competição.
- **`api/solicitacoes/`** — endpoint das solicitações manuais (quando a atualização automática no Notion falha e alguém precisa aprovar manualmente).

### `app/components/`
Aqui ficam as **peças de interface reutilizáveis** — cada arquivo `.tsx` é tipicamente um pedacinho de tela: um card, um modal, uma barra de busca, uma visão inteira (como `AnalyticsView.tsx` ou `FloristasView.tsx`). A ideia de manter isso separado de `page.tsx` é poder reaproveitar essas peças em telas diferentes sem duplicar código.

> ⚠️ **Nota importante:** nem todo arquivo aqui dentro está sendo usado! `Tabs.tsx`, `RareFlowers.tsx`, `PopularFlowers.tsx`, `RankingView.tsx`, `SpotlightCard.tsx`, `Charts.tsx` e `Header.tsx` existem no projeto mas **não são chamados em nenhum lugar da aplicação hoje** (são sobras de versões anteriores da interface). Não se assuste se você não conseguir achar onde eles são usados — eles simplesmente não são. Se um dia alguém pedir pra "reativar" alguma dessas telas, é nesses arquivos que ela provavelmente vai mexer.

### `app/lib/`
Aqui ficam **funções utilitárias e integrações** — código que não é interface, é lógica pura: falar com a API do Notion, calcular a raridade de uma flor, verificar permissões de cargo, etc. A separação existe pra não misturar "como a tela desenha" (`components/`) com "como os dados são buscados e processados" (`lib/`).

- `notion.ts` — cliente de conexão com o Notion.
- `getDashboardData.ts` — monta os dados do dashboard combinando os bancos de flores e floristas do Notion.
- `auth.ts` — configuração do NextAuth (login com Google, dados da sessão).
- `permissoes.ts` — regras de quem pode fazer o quê (cargos de admin, etc.).
- `rarity.ts` — lógica de raridade das flores.
- `imageProxy.ts` — trata imagens vindas do Notion/S3.
- `types.ts` — tipos TypeScript usados no projeto inteiro.
- `helpers.ts` — ⚠️ este também está órfão: nenhum outro arquivo importa nada daqui hoje (a lógica que ele continha foi reescrita direto dentro de `getDashboardData.ts`).

### `app/login/`
A **tela de login**. É uma pasta separada de `app/page.tsx` porque no App Router, cada pasta dentro de `app/` que tem um `page.tsx` vira uma URL própria — nesse caso, `/login`.

### Arquivos soltos direto em `app/`
- `page.tsx` — a tela inicial (`/`), o dashboard principal depois do login.
- `layout.tsx` — o "molde" que envolve todas as páginas (ver seção 3).
- `loading.tsx` — a tela de carregamento animada (logo + barra de progresso) que aparece automaticamente enquanto a página carrega.
- `providers.tsx` — envolve a aplicação com o `SessionProvider` do NextAuth, pra qualquer componente conseguir saber se o usuário está logado.
- `globals.css` — estilos globais (usando Tailwind CSS).

---

## 3. Arquivos "especiais" do Next.js App Router

Esses nomes de arquivo **não são escolha de estilo da equipe** — o Next.js reconhece esses nomes exatos e trata cada um de um jeito específico. Se você renomear um desses por engano, a funcionalidade some silenciosamente. Vale saber o que cada um significa:

| Arquivo | O que ele faz |
|---|---|
| **`page.tsx`** | Define uma página de verdade, acessível por URL. A pasta onde ele está vira o endereço — `app/page.tsx` é `/`, `app/login/page.tsx` é `/login`. |
| **`layout.tsx`** | O "molde" ao redor das páginas daquela pasta (e subpastas). Aqui em `app/layout.tsx` é o layout raiz: define `<html>`, fontes, metadados da aba do navegador, e envolve tudo com os `Providers`. Todo layout continua montado entre trocas de página — não recarrega do zero. |
| **`loading.tsx`** | Tela de carregamento automática. O Next.js mostra esse componente sozinho enquanto a página correspondente ainda está carregando dados no servidor — você não precisa chamar isso manualmente em lugar nenhum. |
| **`route.ts`** | Define um endpoint de API (não uma tela visual). É o que existe dentro de cada pasta em `app/api/`. Dentro dele você exporta funções com nome de verbo HTTP — `GET`, `POST`, `PATCH` — e cada uma vira aquele método na URL correspondente. |
| **`proxy.ts`** (na raiz do projeto) | Roda **antes** de qualquer página ou rota ser processada — é a primeira parada de toda requisição. Aqui no Floralis, ele confere se existe o cookie de sessão de login e redireciona pra `/login` se não existir. Esse arquivo é a versão nova do que em versões antigas do Next.js se chamava `middleware.ts` (o nome mudou no Next.js 16). Importante: ele só faz uma checagem "leve" (o cookie existe?) — a validação de verdade do login acontece dentro das páginas e rotas de API, não aqui. |

---

## 4. Arquivos de configuração na raiz

Não é pra decorar o que cada um faz — é só pra reconhecer o nome quando você abrir a pasta pela primeira vez e não estranhar.

| Arquivo | Serve pra... |
|---|---|
| `package.json` | Lista as dependências do projeto (Next.js, React, NextAuth, etc.) e os comandos disponíveis (`npm run dev`, `npm run build`...). |
| `package-lock.json` | Trava as versões exatas de cada dependência instalada — não mexer nele manualmente. |
| `tsconfig.json` | Configuração do TypeScript (o que ele deve checar, atalhos de importação como `@/app/...`, etc.). |
| `next.config.ts` | Configurações do próprio Next.js — aqui no projeto, principalmente de quais domínios de imagem são permitidos (Notion, S3). |
| `eslint.config.mjs` | Regras de qualidade/estilo de código que o linter (`npm run lint`) verifica. |
| `postcss.config.mjs` | Configuração necessária pro Tailwind CSS v4 processar os estilos. |
| `.env.local` | Variáveis de ambiente sensíveis (chaves do Notion, credenciais do Google, segredos do NextAuth). **Nunca é versionado no Git** — cada pessoa/ambiente tem o seu. |
| `next-env.d.ts` | Arquivo gerado automaticamente pelo Next.js para o TypeScript reconhecer os tipos do framework. Não editar na mão. |
| `tsconfig.tsbuildinfo` | Cache interno do TypeScript pra acelerar builds. Também não se mexe nele. |
| `proxy.ts` | Explicado na seção 3 acima. |
| `.gitignore` | Lista o que o Git deve ignorar (como `node_modules/`, `.env.local`, `.next/`). |
| `README.md` | Descrição geral do projeto. |
| `ICONS_README.md` | Documentação específica sobre os ícones do PWA (Progressive Web App) em `public/`. |

---

## Resumo rápido pra fixar

- **Quer ver como uma tela é montada?** Vá em `app/page.tsx` (ou a pasta correspondente dentro de `app/`) e siga os componentes importados de `app/components/`.
- **Quer entender de onde vêm os dados?** Vá em `app/lib/getDashboardData.ts` e `app/lib/notion.ts`.
- **Quer ver o que acontece quando algo é salvo/alterado?** Vá em `app/api/`.
- **Achou um componente e não sabe onde ele é usado?** Pode ser um dos órfãos listados na seção 2 — é normal, não é erro seu.
