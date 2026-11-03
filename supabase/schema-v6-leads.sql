-- ============================================================
-- Leads da aplicação — Do Zero aos 10k
-- Execute no SQL Editor do Supabase (uma vez).
-- O endpoint /api/aplicacao grava aqui usando a service role key.
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null,
  agencia text,
  tempo_mercado text,
  faturamento text,
  tamanho_time text,
  desafio text,
  canais_aquisicao text[] not null default '{}',
  meta_faturamento text,
  faixa_investimento text,
  prazo text,
  origem text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Mantém instalações antigas compatíveis com o novo formulário.
alter table public.leads add column if not exists agencia text;
alter table public.leads add column if not exists tempo_mercado text;
alter table public.leads add column if not exists faturamento text;
alter table public.leads add column if not exists tamanho_time text;
alter table public.leads add column if not exists canais_aquisicao text[] not null default '{}';

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- A service role bypassa RLS. Nenhum acesso público é liberado.
alter table public.leads enable row level security;

comment on table public.leads is 'Aplicações recebidas pelo formulário /aplicacao (Do Zero aos 10k).';
