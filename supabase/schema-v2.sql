-- ============================================
-- SCHEMA V2 — Priscila Sinópolis
-- Execute este SQL no Supabase SQL Editor
-- Adiciona: auth, admin, RLS completo, buckets
-- ============================================

-- ============================================
-- 1. ATUALIZAR TABELA STUDENTS (adicionar auth_user_id)
-- ============================================

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS password_set boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_access_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE INDEX IF NOT EXISTS students_auth_user_idx ON public.students(auth_user_id);

-- ============================================
-- 2. TABELA ADMIN_USERS (whitelist)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. ATUALIZAR TABELAS DE CURSO (adicionar campos extras)
-- ============================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS total_duration_seconds int DEFAULT 0;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS materials jsonb DEFAULT '[]'::jsonb;

-- ============================================
-- 4. STORAGE BUCKETS
-- ============================================

-- Bucket para vídeos de aulas (privado — signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lessons',
  'lessons',
  false,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para thumbnails e assets públicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-assets',
  'course-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para bônus (PDFs, templates) — privado
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bonuses',
  'bonuses',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/zip', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. FUNÇÃO HELPER: is_admin()
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
  );
$$;

-- ============================================
-- 6. FUNÇÃO HELPER: is_active_student()
-- ============================================

CREATE OR REPLACE FUNCTION public.is_active_student()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE auth_user_id = auth.uid() AND status = 'active'
  );
$$;

-- ============================================
-- 7. REMOVER POLICIES ANTIGAS
-- ============================================

DROP POLICY IF EXISTS "Active students can view courses" ON public.courses;
DROP POLICY IF EXISTS "Active students can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view lessons" ON public.lessons;

-- ============================================
-- 8. RLS POLICIES — COURSES
-- ============================================

-- Alunos ativos veem cursos publicados
CREATE POLICY "Active students can view published courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (
    is_published = true AND public.is_active_student()
  );

-- ============================================
-- 9. RLS POLICIES — LESSONS
-- ============================================

-- Alunos ativos veem aulas publicadas
CREATE POLICY "Active students can view published lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.is_published = true
    )
    AND public.is_active_student()
  );

-- ============================================
-- 10. RLS POLICIES — STUDENT_PROGRESS
-- ============================================

-- Alunos podem ver apenas seu próprio progresso
CREATE POLICY "Students can view own progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- Alunos podem criar/atualizar seu próprio progresso
CREATE POLICY "Students can insert own progress"
  ON public.student_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own progress"
  ON public.student_progress FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- 11. RLS POLICIES — BONUSES
-- ============================================

CREATE POLICY "Active students can view bonuses"
  ON public.bonuses FOR SELECT
  TO authenticated
  USING (public.is_active_student());

-- ============================================
-- 12. RLS POLICIES — STUDENTS (próprio aluno)
-- ============================================

-- Aluno pode ver apenas seus próprios dados
CREATE POLICY "Students can view own data"
  ON public.students FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Aluno pode atualizar apenas seus próprios dados (nome, telefone)
CREATE POLICY "Students can update own data"
  ON public.students FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ============================================
-- 13. RLS POLICIES — ADMIN_USERS
-- ============================================

-- Admins podem ver a si mesmos
CREATE POLICY "Admins can view own data"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- ============================================
-- 14. STORAGE POLICIES
-- ============================================

-- Alunos podem ler vídeos das aulas (signed URLs)
CREATE POLICY "Active students can read lessons videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lessons' AND public.is_active_student()
  );

-- Alunos podem ler bônus
CREATE POLICY "Active students can read bonuses"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'bonuses' AND public.is_active_student()
  );

-- Qualquer um pode ler course-assets (público)
CREATE POLICY "Public can read course assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-assets');

-- ============================================
-- 15. TRIGGER: updated_at em students
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_updated_at ON public.students;
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 16. VIEW: admin_dashboard_stats
-- ============================================

CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') as active_students,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_students,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_students,
  COUNT(*) as total_students,
  COALESCE(SUM(amount_paid) FILTER (WHERE status = 'active'), 0) as total_revenue,
  COALESCE(SUM(amount_paid) FILTER (WHERE status = 'active' AND created_at >= date_trunc('month', now())), 0) as monthly_revenue,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) as monthly_sales
FROM public.students;

-- ============================================
-- 17. SEED: dados iniciais de exemplo (opcional)
-- ============================================

-- Inserir 3 módulos de exemplo (serão editáveis depois no admin)
INSERT INTO public.courses (id, title, description, short_description, order_index, is_published)
VALUES
  (
    'a1b2c3d4-1111-1111-1111-000000000001',
    'Módulo 1 — Fundamentos',
    'Aprenda os fundamentos essenciais de gravação e edição.',
    'Fundamentos da imagem',
    1,
    false
  ),
  (
    'a1b2c3d4-1111-1111-1111-000000000002',
    'Módulo 2 — Stories Magnéticos',
    'Como criar stories que prendem a atenção do início ao fim.',
    'Stories que vendem',
    2,
    false
  ),
  (
    'a1b2c3d4-1111-1111-1111-000000000003',
    'Módulo 3 — Reels que Viralizam',
    'O passo a passo para criar reels com potencial de viralizar.',
    'Reels profissionais',
    3,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIM DO SCHEMA V2
-- ============================================

-- Para criar o primeiro admin, use a API do Supabase ou
-- faça manualmente:
-- 1. Crie o user em Authentication > Users
-- 2. Copie o UUID do user criado
-- 3. Execute:
--    INSERT INTO public.admin_users (auth_user_id, email, full_name, role)
--    VALUES ('UUID-AQUI', 'seu@email.com', 'Seu Nome', 'super_admin');

-- OU use a função helper que vou criar:
-- SELECT public.create_admin_user('seu@email.com', 'Seu Nome');