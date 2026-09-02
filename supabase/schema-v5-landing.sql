-- =====================================================
-- SCHEMA V5: Conteúdo dinâmico da landing pública
-- Não destrutivo — só adiciona tabela.
-- A home lê essa tabela via supabaseAdmin (server-side) e mescla
-- com os defaults embutidos no código (lib/landing-content.ts),
-- então a landing funciona mesmo com as linhas vazias.
-- =====================================================

create table if not exists public.landing_content (
  section text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);

-- updated_at automático
drop trigger if exists trg_landing_content_updated_at on public.landing_content;
create trigger trg_landing_content_updated_at
  before update on public.landing_content
  for each row execute function public.handle_updated_at();

-- Seed inicial: uma linha por seção (vazias -> a app usa defaults)
insert into public.landing_content (section, content)
values
  ('nav',          '{}'::jsonb),
  ('hero',         '{}'::jsonb),
  ('stats',        '{}'::jsonb),
  ('sobre',        '{}'::jsonb),
  ('qualquer_um',  '{}'::jsonb),
  ('produtos',     '{}'::jsonb),
  ('metodo',       '{}'::jsonb),
  ('resultados',   '{}'::jsonb),
  ('faq',          '{}'::jsonb),
  ('cta',          '{}'::jsonb),
  ('footer',       '{}'::jsonb)
on conflict (section) do nothing;

-- RLS: só admins (a leitura pública é feita server-side via service role,
-- que bypassa RLS, então a home não precisa de policy de leitura pública).
alter table public.landing_content enable row level security;

drop policy if exists "Admins have full access to landing_content" on public.landing_content;
create policy "Admins have full access to landing_content"
  on public.landing_content for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================
-- FIM — Conteúdo da landing pronto. Rode no SQL Editor do Supabase.
-- =====================================================