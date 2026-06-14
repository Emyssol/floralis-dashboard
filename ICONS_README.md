# 🌸 Floralis — Atualização de Ícones PWA

## Arquivos de ícone

| Arquivo | Uso |
|---|---|
| `public/favicon.png` | Aba do navegador (todos os browsers) |
| `public/appletouch.png` | iPhone/iPad — atalho na tela inicial |
| `public/iconfloralis.png` | Android / instalação PWA |
| `public/manifest.json` | Configuração do PWA |

---

## ⚠️ Após o deploy — Limpeza de cache obrigatória

Os ícones de PWA ficam em cache no dispositivo. Se o ícone antigo ainda aparecer após o deploy, siga as instruções abaixo.

---

### 📱 iPhone / iPad (Safari)

1. Pressione e segure o atalho do Floralis na tela inicial
2. Toque em **"Remover App"** → **"Remover da Tela Inicial"**
3. Abra o **Safari** → **Ajustes do Safari** → **Limpar Histórico e Dados de Sites**
4. Acesse o site novamente
5. Toque em **Compartilhar** (ícone de seta para cima) → **"Adicionar à Tela de Início"**
6. Confirme o nome **"Floralis"** e toque em **Adicionar**

> ✅ O novo ícone `appletouch.png` será usado.

---

### 🤖 Android (Chrome)

1. Pressione e segure o atalho do Floralis na tela inicial
2. Arraste para **"Remover"** ou toque em **"Desinstalar"**
3. Abra o **Chrome** → menu ⋮ → **Configurações** → **Privacidade** → **Limpar dados de navegação**
   - Marque: **Cache**, **Cookies e dados de sites**
   - Toque em **Limpar dados**
4. Acesse o site novamente
5. O Chrome exibirá um banner **"Instalar Floralis"** — toque em **Instalar**
   - Ou: menu ⋮ → **"Adicionar à tela inicial"**

> ✅ O novo ícone `iconfloralis.png` (512×512) será usado.

---

### 💻 Desktop (Chrome / Edge)

1. Clique no ícone de instalação na barra de endereços (ou menu → "Instalar Floralis")
2. Se já instalado: desinstale pelo gerenciador de apps e reinstale
3. Para forçar atualização do favicon: `Ctrl+Shift+R` (hard reload)

---

## Verificação pós-deploy

Checklist para confirmar que tudo está funcionando:

- [ ] `https://seu-dominio.com/favicon.png` → abre a imagem corretamente
- [ ] `https://seu-dominio.com/appletouch.png` → abre a imagem corretamente
- [ ] `https://seu-dominio.com/iconfloralis.png` → abre a imagem corretamente
- [ ] `https://seu-dominio.com/manifest.json` → retorna o JSON corretamente
- [ ] Aba do browser mostra o ícone Floralis (não o triângulo do Vercel)
- [ ] iPhone: atalho na tela inicial usa `appletouch.png`
- [ ] Android: PWA instalado usa `iconfloralis.png`

---

## Conflitos a evitar

Se existirem os arquivos abaixo na pasta `app/`, **apague-os** — o Next.js os usa como ícones automáticos e sobrescrevem as configurações do `layout.tsx`:

```
app/favicon.ico        ← apagar
app/icon.png           ← apagar
app/icon.ico           ← apagar
app/icon.svg           ← apagar
app/apple-icon.png     ← apagar
app/apple-icon.jpg     ← apagar
```

Mantenha os ícones **apenas em `public/`** para ter controle total.