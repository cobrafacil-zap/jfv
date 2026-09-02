# 📧 CONFIGURAR RESEND PARA ENVIAR EMAILS

O Resend é o serviço que vai enviar os emails de acesso aos alunos após o pagamento.

---

## 1️⃣ CRIAR CONTA NO RESEND

1. Acesse https://resend.com/signup
2. Crie uma conta grátis (100 emails/dia, 3000/mês)
3. Confirme seu email

---

## 2️⃣ ADICIONAR E VERIFICAR DOMÍNIO

Você tem 2 opções:

### **Opção A — Usar domínio próprio (recomendado)** 🏆

1. No painel do Resend, vá em **Domains** → **Add Domain**
2. Digite seu domínio (ex: `priscilasinopolis.com.br`)
3. Ele vai pedir pra adicionar registros DNS no seu provedor (Cloudflare, Registro.br, etc.):
   - **SPF** (TXT): `resend._domainkey`
   - **DKIM** (TXT): `resend._domainkey`
   - **DMARC** (opcional): `_dmarc`
4. Adicione os registros no painel do seu provedor de domínio
5. Volte no Resend e clique em **Verify** — leva alguns minutos
6. Status vai ficar ✅ "Verified"

### **Opção B — Usar domínio de teste do Resend** (rápido)

Pra testar sem ter domínio próprio, pode usar:
- `onboarding@resend.dev` — só envia pro email da sua conta Resend

---

## 3️⃣ GERAR API KEY

1. No painel, vá em **API Keys** → **Create API Key**
2. Dê um nome (ex: "Priscila Cursos")
3. Permissão: **Sending access**
4. Copie a chave (começa com `re_xxxxx`)

⚠️ **ATENÇÃO**: A chave só aparece UMA VEZ. Salve num lugar seguro.

---

## 4️⃣ ADICIONAR VARIÁVEIS NA VERCEL

1. Acesse https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione estas 2 variáveis (marque Production + Preview + Development):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Priscila Sinópolis <contato@seudominio.com.br>
```

⚠️ Substitua `seudominio.com.br` pelo domínio que você verificou no Resend!

---

## 5️⃣ TESTAR

1. Faça deploy (ou só redeploy): `vercel --prod`
2. Faça uma compra teste no site (cartão de teste MP: `5031 4332 1540 6351`)
3. Após o pagamento aprovar:
   - Aluno é criado no Supabase com `status='active'`
   - Webhook chama `create-student-user`
   - Email é enviado via Resend pro email do aluno
4. Verifique o email (e spam!) do aluno

---

## 6️⃣ MONITORAR

No painel do Resend → **Emails**, você vê todos os emails enviados, com status:
- ✅ Delivered
- ❌ Bounced (email inválido)
- ⏳ Pending

---

## 🆘 TROUBLESHOOTING

### Email não chega?

1. Verifique se o domínio está **verified** no Resend
2. Verifique se `RESEND_FROM` usa o domínio verificado
3. Olhe os logs na Vercel: `vercel logs` → procure "Resend"
4. Verifique spam/lixo eletrônico

### Erro "Domain not verified"?

- Confirme que os registros DNS foram adicionados
- DNS pode levar até 48h pra propagar (geralmente minutos)

### Quer testar localmente?

No `.env.local`:
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM=seuemail@gmail.com (só com domínio verificado)
```

---

## 💡 DICA

Pra produção, configure com domínio próprio. Emails enviados de `seu-dominio.com` não vão pro spam, enquanto `gmail.com` sim.

---

**Pronto!** Depois de configurar, qualquer compra aprovada vai disparar email automático pro aluno com o link de definição de senha. 🎉