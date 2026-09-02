-- Schema do Supabase para o curso da Priscila Sinópolis
-- Execute este SQL no Supabase SQL Editor

-- Tabela de alunos
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  phone text,
  cpf text,
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled', 'refunded')),
  mercadopago_payment_id text,
  mercadopago_preference_id text,
  amount_paid numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  accessed_at timestamp with time zone
);

-- Tabela de cursos/módulos
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  order_index int not null,
  thumbnail_url text,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Tabela de aulas
create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  duration_seconds int,
  order_index int not null,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Tabela de progresso do aluno
create table public.student_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  watched boolean default false,
  watched_at timestamp with time zone,
  unique(student_id, lesson_id)
);

-- Tabela de bônus
create table public.bonuses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  file_url text,
  order_index int not null,
  created_at timestamp with time zone default now()
);

-- RLS (Row Level Security)
alter table public.students enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.student_progress enable row level security;
alter table public.bonuses enable row level security;

-- Política: alunos ativos podem ver cursos/aulas
create policy "Active students can view courses"
  on public.courses for select
  using (true); -- público por enquanto, ajustar quando tiver auth

create policy "Active students can view lessons"
  on public.lessons for select
  using (true);

-- Admins têm acesso total via service_role_key
-- (não precisa criar policy explícita, bypass automático)

-- Índices
create index students_email_idx on public.students(email);
create index students_status_idx on public.students(status);
create index lessons_course_idx on public.lessons(course_id);