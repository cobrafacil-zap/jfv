# 🔐 CHECKLIST DE VARIÁVEIS DE AMBIENTE - VERCEL

Cole este checklist na Vercel: **Settings → Environment Variables**

Para cada variável, marque os 3 ambientes: ✅ Production ✅ Preview ✅ Development

---

## ✅ SUPABASE (3 variáveis) - JÁ CONFIGURADAS

```
NEXT_PUBLIC_SUPABASE_URL=https://sooestzoinfwtvvpludr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (sua chave anon)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (sua chave service_role)
```

---

## ⏳ MERCADO PAGO (4 variáveis) - VOCÊ PRECISA ADICIONAR

### Como conseguir:
1. Acesse https://www.mercadopago.com.br/developers/panel/credentials
2. Crie uma aplicação (se não tiver) ou use uma existente
3. Em **Credenciais de teste** (para dev), copie:
   - **Public Key** (começa com `TEST-`)
   - **Access Token** (começa com `TEST-`)
4. Quando for pra produção, troque pelas credenciais que começam com `APP_USR-`

### Variáveis:

```
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_URL=https://seusite.vercel.app/api/webhook/mercadopago
```

⚠️ IMPORTANTE:
- `MERCADOPAGO_PUBLIC_KEY` e `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` são a MESMA chave
- A versão `NEXT_PUBLIC_` permite que o client (browser) acesse
- `MERCADOPAGO_ACCESS_TOKEN` é DIFERENTE - é o token privado do servidor

---

## ⏳ SITE URL (1 variável)

```
NEXT_PUBLIC_SITE_URL=https://seusite.vercel.app
```

⚠️ Troque `seusite.vercel.app` pelo seu domínio real da Vercel

---

## 📋 WEBHOOK NO MERCADO PAGO

Depois de configurar as variáveis acima na Vercel, faça deploy, e então:

1. Acesse https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Clique em **"Configurar webhooks"** ou **"Adicionar URL"**
3. URL: `https://seusite.vercel.app/api/webhook/mercadopago`
4. Selecione o evento: **Pagamentos (payments)**
5. Salve

---

## 🧪 CARTÕES DE TESTE (apenas para TEST-)

**Aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: qualquer futura
- CPF: `123.456.789-09`
- Nome: qualquer

**Rejeitado:**
- Mesmo cartão, mas com CPF inválido

---

## 🎯 RESUMO RÁPIDO

| Variável | Status | Origem |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Já tem | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Já tem | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Já tem | Supabase → Settings → API |
| `MERCADOPAGO_PUBLIC_KEY` | ⏳ Adicionar | MP → Credenciais de teste |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | ⏳ Adicionar | MP → Credenciais de teste |
| `MERCADOPAGO_ACCESS_TOKEN` | ⏳ Adicionar | MP → Credenciais de teste |
| `MERCADOPAGO_WEBHOOK_URL` | ⏳ Adicionar | URL do seu site |
| `NEXT_PUBLIC_SITE_URL` | ⏳ Adicionar | URL do seu site |
