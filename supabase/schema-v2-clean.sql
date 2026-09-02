-- =====================================================
-- RESET COMPLETO + RECRIAR SCHEMA V2 (VERSÃO SEGURA)
-- Não falha se algo já não existir
-- =====================================================

-- Desabilita RLS temporariamente pra poder dropar
alter table if exists public.student_progress disable row level security;
alter table if exists public.payments disable row level security;
alter table if exists public.bonuses disable row level security;
alter table if exists public.lessons disable row level security;
alter table if exists public.courses disable row level security;
alter table if exists public.students disable row level security;
alter table if exists public.admin_users disable row level security;

-- 1. Remove policies existentes (ignora se não existir)
do $$
declare
  r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2. Remove tabelas (CASCADE remove dependências)
drop table if exists public.student_progress cascade;
drop table if exists public.payments cascade;
drop table if exists public.bonuses cascade;
drop table if exists public.lessons cascade;
drop table if exists public.courses cascade;
drop table if exists public.students cascade;
drop table if exists public.admin_users cascade;

-- 3. Remove funções
drop function if exists public.is_admin() cascade;
drop function if exists public.is_active_student() cascade;
drop function if exists public.handle_updated_at() cascade;

-- 4. Remove view
drop view if exists public.admin_dashboard_stats cascade;

-- 5. NÃO remove buckets via SQL (Supabase proíbe isso)
-- Os buckets serão recriados com "on conflict do nothing" abaixo
-- Se você quiser deletar buckets existentes, faça manualmente em:
-- Supabase Dashboard → Storage → [bucket] → Delete

-- =====================================================
-- AGORA RECRIA TUDO DO ZERO
-- =====================================================

-- 1. Extensões
create extension if not exists "uuid-ossp";

-- 2. Tabela de alunos
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  cpf text,
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive', 'refunded')),
  amount_paid numeric(10, 2),
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  password_set boolean default false,
  first_access_at timestamp with time zone,
  accessed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_students_email on public.students(email);
create index idx_students_auth_user_id on public.students(auth_user_id);
create index idx_students_status on public.students(status);

-- 3. Tabela de cursos (módulos)
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  short_description text,
  cover_image_url text,
  order_index integer not null default 0,
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_courses_order on public.courses(order_index);
create index idx_courses_published on public.courses(is_published);

-- 4. Tabela de aulas
create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  video_path text,
  duration_seconds integer default 0,
  order_index integer not null default 0,
  is_published boolean default false,
  materials jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_lessons_course on public.lessons(course_id);
create index idx_lessons_published on public.lessons(is_published);
create index idx_lessons_order on public.lessons(course_id, order_index);

-- 5. Tabela de bônus
create table public.bonuses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  file_url text,
  file_path text,
  cover_image_url text,
  order_index integer not null default 0,
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_bonuses_published on public.bonuses(is_published);
create index idx_bonuses_order on public.bonuses(order_index);

-- 6. Tabela de progresso dos alunos
create table public.student_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  watched boolean default false,
  progress_percent integer default 0 check (progress_percent >= 0 and progress_percent <= 100),
  watched_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(student_id, lesson_id)
);

create index idx_progress_student on public.student_progress(student_id);
create index idx_progress_lesson on public.student_progress(lesson_id);
create index idx_progress_watched on public.student_progress(student_id, watched);

-- 7. Tabela de pagamentos
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete set null,
  mercadopago_payment_id text,
  amount numeric(10, 2) not null,
  status text not null check (status in ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
  payment_method text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_payments_student on public.payments(student_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_paid_at on public.payments(paid_at);

-- 8. Tabela de admins
create table public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamp with time zone default now()
);

create index idx_admin_users_auth on public.admin_users(auth_user_id);
create index idx_admin_users_email on public.admin_users(email);

-- 9. Função para updated_at automático
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 10. Triggers de updated_at
drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
  before update on public.students
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_bonuses_updated_at on public.bonuses;
create trigger trg_bonuses_updated_at
  before update on public.bonuses
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_progress_updated_at on public.student_progress;
create trigger trg_progress_updated_at
  before update on public.student_progress
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

-- 11. Função helper: é admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_users
    where auth_user_id = auth.uid()
  );
$$;

-- 12. Função helper: é aluno ativo?
create or replace function public.is_active_student()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.students
    where auth_user_id = auth.uid() and status = 'active'
  );
$$;

-- 13. Habilita RLS em todas as tabelas
alter table public.students enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.bonuses enable row level security;
alter table public.student_progress enable row level security;
alter table public.payments enable row level security;
alter table public.admin_users enable row level security;

-- 14. POLICIES - CURSOS
create policy "Admins have full access to courses"
  on public.courses for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Active students can view published courses"
  on public.courses for select
  using (is_published = true and public.is_active_student());

-- 15. POLICIES - AULAS
create policy "Admins have full access to lessons"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Active students can view published lessons"
  on public.lessons for select
  using (
    is_published = true
    and exists (
      select 1 from public.courses
      where id = lessons.course_id and is_published = true
    )
    and public.is_active_student()
  );

-- 16. POLICIES - BÔNUS
create policy "Admins have full access to bonuses"
  on public.bonuses for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Active students can view published bonuses"
  on public.bonuses for select
  using (is_published = true and public.is_active_student());

-- 17. POLICIES - ALUNOS
create policy "Admins have full access to students"
  on public.students for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Students can view own data"
  on public.students for select
  using (auth_user_id = auth.uid());

create policy "Enable insert for checkout"
  on public.students for insert
  with check (true);

create policy "Students can update own data"
  on public.students for update
  using (auth_user_id = auth.uid());

-- 18. POLICIES - PROGRESSO
create policy "Admins can view all progress"
  on public.student_progress for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Students can view own progress"
  on public.student_progress for select
  using (
    student_id in (
      select id from public.students where auth_user_id = auth.uid()
    )
  );

create policy "Students can insert own progress"
  on public.student_progress for insert
  with check (
    student_id in (
      select id from public.students where auth_user_id = auth.uid()
    )
  );

create policy "Students can update own progress"
  on public.student_progress for update
  using (
    student_id in (
      select id from public.students where auth_user_id = auth.uid()
    )
  );

-- 19. POLICIES - PAGAMENTOS
create policy "Admins have full access to payments"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Students can view own payments"
  on public.payments for select
  using (
    student_id in (
      select id from public.students where auth_user_id = auth.uid()
    )
  );

-- 20. POLICIES - ADMINS
create policy "Admins can view admin list"
  on public.admin_users for select
  using (public.is_admin());

-- 21. View de estatísticas para dashboard
create or replace view public.admin_dashboard_stats as
select
  (select count(*) from public.students where status = 'active') as total_active_students,
  (select count(*) from public.students) as total_students,
  (select count(*) from public.students where created_at >= date_trunc('month', now())) as new_students_this_month,
  (select coalesce(sum(amount), 0) from public.payments where status = 'approved') as total_revenue,
  (select coalesce(sum(amount), 0) from public.payments where status = 'approved' and paid_at >= date_trunc('month', now())) as revenue_this_month,
  (select count(*) from public.payments where status = 'approved') as total_payments,
  (select count(*) from public.payments where status = 'approved' and paid_at >= date_trunc('month', now())) as payments_this_month;

-- 22. Buckets de storage
insert into storage.buckets (id, name, public)
values ('lessons', 'lessons', false)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('bonuses', 'bonuses', false)
on conflict do nothing;

-- 23. Seed: 3 módulos de exemplo
insert into public.courses (title, description, short_description, order_index, is_published)
values
  ('Módulo 1 — Preparação', 'Tudo que você precisa saber antes de começar a gravar.', 'Equipamentos e setup inicial', 1, true),
  ('Módulo 2 — Gravando Stories', 'Técnicas para gravar stories profissionais.', 'Domine os stories', 2, true),
  ('Módulo 3 — Gravando Reels', 'Como criar reels que engajam.', 'Reels que viralizam', 3, false)
on conflict do nothing;

-- =====================================================
-- FIM - TUDO PRONTO! 🎉
-- =====================================================