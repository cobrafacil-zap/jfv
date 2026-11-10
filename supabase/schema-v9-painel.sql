-- =====================================================
-- SCHEMA V9: complementos do painel
-- Não destrutivo. Execute depois do schema-v8.
--
-- Adiciona a posição do botão de WhatsApp (flutuante, hero,
-- popup etc.) e índices para as novas visões do painel.
-- =====================================================

alter table public.analytics_events
  add column if not exists placement text;

create index if not exists idx_analytics_events_campaign
  on public.analytics_events(utm_source, utm_medium, utm_campaign);

create index if not exists idx_analytics_events_device
  on public.analytics_events(device, event_ts);

create index if not exists idx_analytics_events_page
  on public.analytics_events(page, event_ts);

comment on column public.analytics_events.placement is
  'Posição do botão de WhatsApp clicado (flutuante, hero, popup-saida, programa-* etc.)';
