# 🔧 Diagnóstico: Magic link voltando para a LP

## O que estava acontecendo

O link no email ia para `https://videosparaperfil.vercel.app/#access_token=...` (domínio VELHO do Vercel). Como esse domínio antigo não tem mais a rota `/auth/callback`, o usuário caía na landing page.

**Causa raiz:** A variável `NEXT_PUBLIC_SITE_URL` no Vercel ainda estava apontando para o domínio antigo (ou a função que gera o link estava usando URL hardcoded).

---

## ✅ Correções aplicadas no código

### 1. `app/api/auth/create-student-user/route.ts`
- Importa `getSiteUrl()` de `lib/urls.ts` (centraliza a URL)
- Adiciona log mostrando qual URL está sendo usada
- Fallback manual do `action_link` se Supabase não retornar
- Return inclui `siteUrl` e `callbackUrl` no JSON

### 2. `app/api/webhook/mercadopago/route.ts`
- Usa `getSiteUrl()` em vez de `process.env.NEXT_PUBLIC_SITE_URL || host`
- Logs de debug mostrando o magic link gerado

### 3. `app/auth/callback/page.tsx` (já estava certo)
- Processa tokens do hash e da query string
- Escuta `onAuthStateChange` como fallback
- Redireciona para `/cadastro` (type=magiclink) ou `/membros`

### 4. `app/(auth)/cadastro/page.tsx` (refeito)
- Verifica sessão ao carregar (redireciona pro login se não tiver)
- **NÃO usa mais `supabaseAdmin` no client** (vazava a service role key!)
- Chama nova API `complete-registration` com o token do usuário

### 5. `app/api/auth/complete-registration/route.ts` (NOVO)
- Marca `password_set=true` e `first_access_at`
- Usa o token do usuário logado (respeita RLS)

---

## 🔍 O que VOCÊ precisa verificar na Vercel

### Passo 1: Acessar Environment Variables
1. Vercel → seu projeto → **Settings** → **Environment Variables**
2. Procure por `NEXT_PUBLIC_SITE_URL`

### Passo 2: Conferir o valor

| Situação | Valor correto |
|----------|---------------|
| Domínio `jeitofacildevender.online` já aponta pra Vercel | `https://jeitofacildevender.online` |
| Domínio ainda não configurado (usando Vercel default) | `https://seu-projeto.vercel.app` (atual) |

⚠️ **Se estiver `https://videosparaperfil.vercel.app`, TROQUE para o domínio atual!**

### Passo 3: Configurar Supabase Auth URLs

No painel do Supabase → **Authentication** → **URL Configuration**:

| Campo | Valor |
|-------|-------|
| **Site URL** | `https://jeitofacildevender.online` (ou o domínio atual) |
| **Redirect URLs** | Adicione: `https://jeitofacildevender.online/auth/callback` |

Sem isso, o Supabase pode BLOQUEAR o redirect.

### Passo 4: Redeploy
Depois de mudar as env vars, faça um redeploy (Deployments → ... → Redeploy).

---

## 🧪 Como testar depois do redeploy

1. **Compra teste no checkout** (R$ 0,10, cartão de teste MP)
2. Aguarda email chegar (verifica Spam/Promoções)
3. **Copia o link do email ANTES de clicar** e confere o domínio:
   - ✅ Deve ser: `https://seu-dominio/auth/callback#access_token=...`
   - ❌ Se for `videosparaperfil.vercel.app`, a env var tá errada
4. Clica no link
5. Deve cair na tela de "Defina sua senha" (`/cadastro`)
6. Define senha → entra em `/membros`

---

## 🐛 Se ainda der erro

### Erro "redirect_uri not in list of allowed redirects"
→ Falta adicionar a URL em **Supabase → Auth → URL Configuration → Redirect URLs**

### Link ainda vai pro domínio antigo
→ `NEXT_PUBLIC_SITE_URL` na Vercel ainda tá errado, ou o email foi gerado ANTES do redeploy

### Email não chega
→ Verifica:
- Resend → `jeitofacildevender.online` está VERIFICADO?
- DNS na Hostinger aponta pra Resend?
- Pasta Spam/Promoções

### Callback mostra "Link inválido ou expirado"
→ Token já foi usado (magic link só funciona 1x)
→ Gera um novo link em `/login` → "Entrar com link mágico"

---

## 📋 Checklist final

- [ ] `NEXT_PUBLIC_SITE_URL` na Vercel = domínio atual (não o antigo)
- [ ] Supabase Auth → Site URL = mesmo domínio
- [ ] Supabase Auth → Redirect URLs contém `/auth/callback` desse domínio
- [ ] Resend → domínio `jeitofacildevender.online` verificado
- [ ] DNS na Hostinger com registros do Resend
- [ ] Redeploy feito na Vercel depois de mudar tudo
- [ ] Teste de compra → email → callback → cadastro → membros
