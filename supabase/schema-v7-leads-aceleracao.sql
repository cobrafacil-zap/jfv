-- ============================================================
-- Leads do diagnóstico — Aceleração Comercial
-- Execute no SQL Editor do Supabase (uma vez).
-- O endpoint /api/aceleracao grava aqui usando a service role key.
-- ============================================================

create table if not exists public.leads_aceleracao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null,
  empresa text,
  segmento text,
  tempo_mercado text,
  faturamento text,
  time_comercial text,
  desafio text,
  canais_aquisicao text[] not null default '{}',
  meta_faturamento text,
  faixa_investimento text,
  prazo text,
  origem text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_aceleracao_created_at_idx
  on public.leads_aceleracao (created_at desc);

-- A service role bypassa RLS. Nenhum acesso público é liberado.
alter table public.leads_aceleracao enable row level security;

comment on table public.leads_aceleracao is 'Diagnósticos recebidos pelo formulário /aceleracao (Aceleração Comercial).';
