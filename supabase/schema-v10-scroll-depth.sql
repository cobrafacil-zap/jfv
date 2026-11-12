-- =====================================================
-- SCHEMA V10: profundidade de leitura
-- Não destrutivo. Execute depois do schema-v9.
--
-- Adiciona a coluna `depth` (25, 50, 75, 90, 100) e libera o
-- novo tipo de evento `scroll_depth`.
-- =====================================================

alter table public.analytics_events
  add column if not exists depth integer;

alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check check (
    event_type in (
      'pageview',
      'click_programa',
      'click_whatsapp',
      'form_submit',
      'scroll_depth'
    )
  );

alter table public.analytics_events
  drop constraint if exists analytics_events_depth_check;

alter table public.analytics_events
  add constraint analytics_events_depth_check check (
    depth is null or (depth between 1 and 100)
  );

comment on column public.analytics_events.depth is
  'Profundidade de leitura da página em % (25, 50, 75, 90, 100)';
