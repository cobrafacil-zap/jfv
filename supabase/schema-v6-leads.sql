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
  negocio text,
  momento text,
  meta_faturamento text,
  desafio text,
  estrutura text[] not null default '{}',
  tempo_disponivel text,
  faixa_investimento text,
  prazo text,
  origem text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- A service role bypassa RLS. Nenhum acesso público é liberado.
alter table public.leads enable row level security;

comment on table public.leads is 'Aplicações recebidas pelo formulário /aplicacao (Do Zero aos 10k).';
