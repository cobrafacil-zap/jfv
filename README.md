# Site do Curso — Priscila Sinópolis

> Plataforma completa: **landing de vendas + checkout + área de membros + painel admin** para o curso **"Como gravar bons vídeos para o seu perfil pelo celular"**, da Priscila Sinópolis.

Stack: **Next.js 14** · **TypeScript** · **Tailwind CSS** · **Supabase (Postgres + Auth + Storage)** · **Mercado Pago (Bricks)**

---

## ✨ Funcionalidades

### Site público
- ✅ Landing page completa de alta conversão (12 seções)
- ✅ Design moderno preto + rosa/magenta (estilo creator)
- ✅ 100% responsivo (mobile, tablet, desktop)
- ✅ Animações de scroll
- ✅ Página de checkout com formulário + validação
- ✅ Integração com **Mercado Pago Checkout Bricks**
- ✅ Webhook para confirmação automática de pagamento
- ✅ Página de sucesso pós-pagamento

### Autenticação
- ✅ Magic link por e-mail
- ✅ Definição de senha no primeiro acesso (`/cadastro`)
- ✅ Recuperação de senha
- ✅ Login unificado (aluno e admin na mesma tela)
- ✅ Middleware de proteção de rotas (`/membros/*` e `/admin/*`)

### Área de membros (estilo Netflix)
- ✅ Sidebar fixa com navegação
- ✅ Home com "Continue assistindo" + grid de módulos
- ✅ Página de módulo com lista de aulas e progresso
- ✅ Player de vídeo com signed URL (1h de expiração)
- ✅ Tracking automático de progresso (marca como assistido em 80%)
- ✅ Vídeos com proteção (sem download, sem picture-in-picture, sem right-click)
- ✅ Bônus para download
- ✅ Perfil editável do aluno

### Painel administrativo
- ✅ Dashboard com KPIs (alunos ativos, receita, vendas do mês, conversão)
- ✅ Gráfico de vendas dos últimos 30 dias (Recharts)
- ✅ Lista de alunos com busca + filtro por status
- ✅ Detalhe do aluno (dados, pagamentos, progresso)
- ✅ CRUD de módulos (criar, editar, publicar, excluir)
- ✅ CRUD de aulas com **upload de vídeo direto pro Supabase Storage**
- ✅ Detecção automática de duração do vídeo
- ✅ CRUD de bônus com upload de arquivo
- ✅ Página de configurações do admin

### Segurança
- ✅ Row Level Security (RLS) no Supabase
- ✅ Vídeos em bucket privado (signed URLs)
- ✅ Service Role Key apenas no servidor
- ✅ Verificação de admin em todas as rotas `/api/admin/*`
- ✅ Verificação de aluno ativo em todas as rotas `/api/aluno/*`

---

## 📁 Estrutura

```
.
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── recuperar-senha/page.tsx
│   ├── membros/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── bonus/page.tsx
│   │   ├── perfil/page.tsx
│   │   └── curso/[moduleId]/
│   │       ├── page.tsx
│   │       └── aula/[lessonId]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── alunos/[id]/page.tsx
│   │   ├── modulos/[id]/page.tsx
│   │   ├── aulas/[id]/page.tsx
│   │   ├── bonus/[id]/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── api/
│   │   ├── auth/create-student-user/route.ts
│   │   ├── admin/{modules,lessons,bonuses,students,upload}/route.ts
│   │   ├── aluno/{video-url,progress,profile}/route.ts
│   │   ├── checkout/create-preference/route.ts
│   │   └── webhook/mercadopago/route.ts
│   ├── checkout/{page,success/page}.tsx
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                  # Button, Input, Card, Accordion
│   ├── landing/             # 12 seções da landing
│   ├── membros/             # Sidebar, VideoPlayer, PerfilForm
│   └── admin/               # Sidebar, StatCard, forms
├── lib/
│   ├── supabase.ts          # Cliente admin (service role)
│   ├── supabase-server.ts   # Cliente com cookies (RSC)
│   ├── supabase-client.ts   # Cliente browser
│   ├── auth.ts              # Helpers de sessão
│   ├── admin-api.ts         # requireAdmin()
│   └── mercadopago.ts
├── supabase/
│   ├── schema.sql           # v1 (básico)
│   └── schema-v2.sql        # v2 (auth, admin, RLS, buckets)
├── middleware.ts            # Proteção de rotas
├── tailwind.config.ts
└── .env.example
```

---

## 🚀 Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute **na ordem**:
   - `supabase/schema.sql` (tabelas base)
   - `supabase/schema-v2.sql` (auth, admin, RLS, buckets)
4. Em **Authentication > Users**, crie o usuário admin manualmente (ou via SQL):
   ```sql
   insert into auth.users (id, email, encrypted_password, email_confirmed_at)
   values (gen_random_uuid(), 'seu@email.com', crypt('suasenha', gen_salt('bf')), now());
   ```
   Depois insira em `admin_users`:
   ```sql
   insert into public.admin_users (auth_user_id, email, full_name, role)
   values ((select id from auth.users where email='seu@email.com'), 'seu@email.com', 'Seu Nome', 'super_admin');
   ```
5. Copie as credenciais em **Settings > API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

### 3. Configurar Mercado Pago

1. Crie uma aplicação em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers/panel)
2. Copie suas credenciais de teste:
   - `Public Key` → `MERCADOPAGO_PUBLIC_KEY` e `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`

### 4. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha todas as variáveis.

### 5. Rodar

```bash
npm run dev
```

Acesse:
- Landing: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Membros: [http://localhost:3000/membros](http://localhost:3000/membros)

---

## 🧪 Como testar o pagamento (sandbox)

No checkout, use os dados de teste do Mercado Pago:

**Cartão aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: qualquer futura
- CPF: `123.456.789-09`

**Cartão rejeitado:** mesmo cartão, mas com CPF inválido.

Após o pagamento aprovado:
1. O webhook cria/atualiza o aluno em `students` com `status='active'`
2. A API `/api/auth/create-student-user` é chamada e cria o user no `auth.users`
3. Um magic link é enviado para o e-mail do aluno
4. Aluno clica → define senha → entra em `/membros`

---

## 🔄 Fluxos

### Aluno
```
Paga no checkout
   ↓
Webhook MP → atualiza students.status = 'active'
   ↓
create-student-user → cria user em auth.users + envia magic link
   ↓
Aluno clica no e-mail → /cadastro (define senha)
   ↓
/membros → navega pelos módulos → assiste aulas
   ↓
Progresso é salvo a cada pausa + marcado como visto em 80%
```

### Admin
```
Login em /login (com email admin)
   ↓
Middleware verifica admin_users → libera /admin
   ↓
Dashboard → KPIs e gráfico
   ↓
Cria módulos → cria aulas (upload de vídeo) → publica
   ↓
Lista de alunos → detalhe → atualiza status se necessário
```

---

## 🌐 Deploy na Vercel

### 1. Subir código para o GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/priscila-videos.git
git push -u origin main
```

### 2. Importar na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. **Add New Project** → selecione o repositório
3. Configure as Environment Variables
4. **Deploy**

### 3. Webhook do Mercado Pago

No painel do MP:
- URL: `https://seusite.vercel.app/api/webhook/mercadopago`
- Eventos: `payment`

### 4. Supabase Auth (produção)

No Supabase Dashboard → **Authentication > URL Configuration**:
- Adicione `https://seusite.vercel.app` em **Site URL**
- Adicione `https://seusite.vercel.app/**` em **Redirect URLs**

---

## 🎨 Customização

### Cores
Edite `tailwind.config.ts`:
```ts
colors: {
  accent: { DEFAULT: "#FF2D87", light: "#FF5BA0", dark: "#CC1F69" },
}
```

### Preço
- `components/landing/Pricing.tsx`
- `app/api/checkout/create-preference/route.ts`

### Textos da landing
Cada seção está em `components/landing/[Secao].tsx`.

---

## 🛠 Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind |
| UI | shadcn/ui-style + Lucide Icons |
| Backend | Next.js API Routes |
| Banco | Supabase Postgres |
| Auth | Supabase Auth (magic link + password) |
| Storage | Supabase Storage (signed URLs) |
| Pagamento | Mercado Pago Checkout Bricks |
| Gráficos | Recharts |
| Upload | XHR com progress |
| Validação | Zod |

---

## 📋 Verificação end-to-end

### Setup
- [ ] `npm install` rodou
- [ ] `.env.local` preenchido
- [ ] `schema.sql` + `schema-v2.sql` executados no Supabase
- [ ] Admin criado em `admin_users`

### Auth
- [ ] Login com magic link funciona
- [ ] Cadastro (definir senha) funciona
- [ ] Recuperação de senha funciona
- [ ] `/membros` bloqueia sem login
- [ ] `/admin` bloqueia sem ser admin

### Aluno
- [ ] Compra de teste no checkout
- [ ] Webhook ativa aluno
- [ ] Magic link chega no e-mail
- [ ] Aluno consegue assistir aula
- [ ] Progresso é salvo
- [ ] Aula fica marcada como assistida em 80%

### Admin
- [ ] Dashboard mostra KPIs reais
- [ ] Gráfico de vendas aparece
- [ ] Criar módulo funciona
- [ ] Upload de aula funciona (vídeo aparece no player)
- [ ] Criar bônus funciona
- [ ] Lista de alunos filtra por status
- [ ] Detalhe do aluno mostra pagamentos

---

## 📚 Recursos úteis

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Auth SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Mercado Pago Bricks](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/landing)
- [Recharts](https://recharts.org/)

---

## 📞 Contato

Priscila Sinópolis: [@priscila_sinopolis](https://www.instagram.com/priscila_sinopolis/)

---

**Desenvolvido com 💜 para Priscila Sinópolis**
