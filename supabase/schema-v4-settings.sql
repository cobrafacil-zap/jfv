-- =====================================================
-- SCHEMA V4: Site settings (key/value para configurações dinâmicas)
-- Não destrutivo - só adiciona tabela
-- =====================================================

-- 1) Tabela genérica de configurações do site
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text,
  updated_at timestamp with time zone default now()
);

create index if not exists idx_site_settings_key on public.site_settings(key);

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.handle_updated_at();

-- 2) Seed inicial: link do grupo de WhatsApp da comunidade
insert into public.site_settings (key, value)
values ('community_whatsapp_url', '')
on conflict (key) do nothing;

-- 3) RLS
alter table public.site_settings enable row level security;

drop policy if exists "Admins have full access to site_settings" on public.site_settings;

-- Apenas admins podem ler/escrever (páginas server-side usam supabaseAdmin
-- e bypassam RLS, então funciona normalmente)
create policy "Admins have full access to site_settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================
-- FIM - Configurações do site estão prontas
-- =====================================================
