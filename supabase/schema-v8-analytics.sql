-- =====================================================
-- SCHEMA V8: Analytics da landing (eventos anônimos)
-- Não destrutivo — só adiciona tabela e índices.
--
-- O painel detecta esta tabela automaticamente. Enquanto ela não
-- existir, os eventos são gravados em `site_settings` (KV) e o painel
-- continua funcionando. Rodar este SQL é recomendado para melhor
-- desempenho e consultas por período.
-- =====================================================

create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null check (
    event_type in ('pageview', 'click_programa', 'click_whatsapp', 'form_submit')
  ),
  visitor_id text not null,
  session_id text,
  page text,
  program_id text,
  program_name text,
  form_id text,
  placement text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  device text check (device in ('mobile', 'desktop')),
  event_ts timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

-- Consultas do painel: período + tipo.
create index if not exists idx_analytics_events_ts
  on public.analytics_events(event_ts);

create index if not exists idx_analytics_events_type_ts
  on public.analytics_events(event_type, event_ts);

create index if not exists idx_analytics_events_visitor
  on public.analytics_events(visitor_id, event_ts);

-- =====================================================
-- RLS: apenas service role acessa. Nenhum acesso público.
-- (o site grava via /api/track no servidor, com service role)
-- =====================================================
alter table public.analytics_events enable row level security;

drop policy if exists "Service role manages analytics events" on public.analytics_events;

create policy "Service role manages analytics events"
  on public.analytics_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- =====================================================
-- Limpeza opcional de eventos antigos (mais de 1 ano).
-- Pode ser chamada manualmente ou por cron externo:
--   select public.prune_analytics_events(365);
-- =====================================================
create or replace function public.prune_analytics_events(retain_days integer default 365)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted integer;
begin
  delete from public.analytics_events
  where event_ts < now() - make_interval(days => greatest(retain_days, 30));

  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke all on function public.prune_analytics_events(integer) from public;
grant execute on function public.prune_analytics_events(integer) to service_role;
