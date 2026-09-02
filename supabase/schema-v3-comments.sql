-- =====================================================
-- SCHEMA V3: Comentários + Materiais múltiplos + Thumbnail
-- Não destrutivo - só adiciona tabelas/colunas
-- =====================================================

-- 1) Comentários das aulas
create table if not exists public.lesson_comments (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  author_auth_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_role text not null default 'student' check (author_role in ('student', 'admin')),
  content text not null check (length(content) > 0 and length(content) <= 2000),
  parent_id uuid references public.lesson_comments(id) on delete cascade,
  is_hidden boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_lesson_comments_lesson on public.lesson_comments(lesson_id, created_at desc);
create index if not exists idx_lesson_comments_author on public.lesson_comments(author_auth_id);
create index if not exists idx_lesson_comments_parent on public.lesson_comments(parent_id);

drop trigger if exists trg_lesson_comments_updated_at on public.lesson_comments;
create trigger trg_lesson_comments_updated_at
  before update on public.lesson_comments
  for each row execute function public.handle_updated_at();

-- 2) Materiais múltiplos por aula
create table if not exists public.lesson_materials (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  type text not null check (type in ('file', 'link')),
  file_path text,
  file_url text,
  file_size bigint,
  order_index integer not null default 0,
  created_at timestamp with time zone default now()
);

create index if not exists idx_lesson_materials_lesson on public.lesson_materials(lesson_id, order_index);

-- 3) Thumbnail da aula
alter table public.lessons
  add column if not exists thumbnail_url text,
  add column if not exists thumbnail_path text;

-- 4) RLS
alter table public.lesson_comments enable row level security;
alter table public.lesson_materials enable row level security;

-- Drop policies antigas (se existirem) pra não duplicar
drop policy if exists "Admins have full access to comments" on public.lesson_comments;
drop policy if exists "Admins have full access to materials" on public.lesson_materials;
drop policy if exists "Active students can view comments" on public.lesson_comments;
drop policy if exists "Active students can insert own comments" on public.lesson_comments;
drop policy if exists "Students can update own comments" on public.lesson_comments;
drop policy if exists "Students can delete own comments" on public.lesson_comments;
drop policy if exists "Active students can view materials" on public.lesson_materials;

-- Admins: acesso total
create policy "Admins have full access to comments"
  on public.lesson_comments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins have full access to materials"
  on public.lesson_materials for all
  using (public.is_admin())
  with check (public.is_admin());

-- Alunos: veem comentários não ocultos de aulas publicadas
create policy "Active students can view comments"
  on public.lesson_comments for select
  using (
    is_hidden = false
    and exists (
      select 1 from public.lessons
      where id = lesson_comments.lesson_id and is_published = true
    )
    and public.is_active_student()
  );

-- Alunos: podem inserir (com seu próprio auth.uid)
create policy "Active students can insert own comments"
  on public.lesson_comments for insert
  with check (
    author_auth_id = auth.uid()
    and public.is_active_student()
  );

-- Alunos: editam/apagam os próprios
create policy "Students can update own comments"
  on public.lesson_comments for update
  using (author_auth_id = auth.uid());

create policy "Students can delete own comments"
  on public.lesson_comments for delete
  using (author_auth_id = auth.uid());

-- Materiais: aluno ativo pode ver materiais de aulas publicadas
create policy "Active students can view materials"
  on public.lesson_materials for select
  using (
    exists (
      select 1 from public.lessons
      where id = lesson_materials.lesson_id and is_published = true
    )
    and public.is_active_student()
  );

-- 5) View útil pro admin
create or replace view public.admin_comments_stats as
select
  lesson_id,
  count(*) filter (where not is_hidden) as visible_count,
  count(*) filter (where is_hidden) as hidden_count,
  max(created_at) as last_comment_at
from public.lesson_comments
group by lesson_id;

-- =====================================================
-- FIM - Comentários e materiais estão prontos
-- =====================================================