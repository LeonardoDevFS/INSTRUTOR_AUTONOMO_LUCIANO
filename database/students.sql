-- Direção Segura — gestão privada de alunos no Supabase PostgreSQL.
-- Migração aditiva: não apaga, renomeia nem altera reservas existentes.
-- Revise e execute manualmente no SQL Editor somente após autorização.

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 3 AND 120),
  phone text NOT NULL CHECK (char_length(trim(phone)) BETWEEN 10 AND 24),
  phone_normalized text NOT NULL CHECK (phone_normalized ~ '^[0-9]{10,15}$'),
  email text,
  email_normalized text,
  birth_date date,
  training_category text NOT NULL CHECK (training_category IN ('A', 'B', 'A+B')),
  service_type text NOT NULL CHECK (char_length(trim(service_type)) BETWEEN 3 AND 80),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NULL OR char_length(trim(email)) BETWEEN 5 AND 160),
  CHECK (email_normalized IS NULL OR email_normalized = lower(email_normalized))
);

CREATE UNIQUE INDEX IF NOT EXISTS students_obvious_identity_unique_idx
  ON public.students (lower(trim(full_name)), phone_normalized);
CREATE INDEX IF NOT EXISTS students_list_idx
  ON public.students (archived_at, status, training_category, created_at DESC);
CREATE INDEX IF NOT EXISTS students_phone_idx
  ON public.students (phone_normalized);
CREATE INDEX IF NOT EXISTS students_email_idx
  ON public.students (email_normalized)
  WHERE email_normalized IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.license_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  process_type text NOT NULL CHECK (
    process_type IN ('first_license', 'category_addition', 'licensed_training', 'practical_test')
  ),
  category text NOT NULL CHECK (category IN ('A', 'B', 'A+B')),
  status_label text NOT NULL CHECK (char_length(trim(status_label)) BETWEEN 2 AND 80),
  steps jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(steps) = 'array'),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 2000),
  started_on date,
  completed_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (completed_on IS NULL OR started_on IS NULL OR completed_on >= started_on)
);

CREATE INDEX IF NOT EXISTS license_processes_student_idx
  ON public.license_processes (student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  modality text NOT NULL CHECK (char_length(trim(modality)) BETWEEN 2 AND 80),
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 50 CHECK (duration_minutes BETWEEN 10 AND 480),
  status text NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled', 'no_show')
  ),
  content text CHECK (content IS NULL OR char_length(content) <= 2000),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 3000),
  booking_reservation_id uuid REFERENCES public.booking_reservations(id) ON DELETE SET NULL,
  google_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lessons_student_date_idx
  ON public.lessons (student_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS lessons_future_idx
  ON public.lessons (starts_at)
  WHERE status = 'scheduled';
CREATE UNIQUE INDEX IF NOT EXISTS lessons_booking_reservation_unique_idx
  ON public.lessons (booking_reservation_id)
  WHERE booking_reservation_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.student_skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  vehicle_category text NOT NULL CHECK (vehicle_category IN ('A', 'B')),
  skill_code text NOT NULL CHECK (skill_code ~ '^[a-z0-9_-]{2,60}$'),
  skill_label text NOT NULL CHECK (char_length(trim(skill_label)) BETWEEN 2 AND 100),
  level text NOT NULL CHECK (
    level IN ('not_assessed', 'learning', 'developing', 'autonomous')
  ),
  comments text CHECK (comments IS NULL OR char_length(comments) <= 1500),
  assessed_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_skills_timeline_idx
  ON public.student_skill_assessments (student_id, assessed_on DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  content text NOT NULL CHECK (char_length(trim(content)) BETWEEN 2 AND 3000),
  author_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_notes_timeline_idx
  ON public.student_notes (student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 2 AND 160),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  lessons_count integer CHECK (lessons_count IS NULL OR lessons_count > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'partial', 'paid', 'cancelled')
  ),
  agreed_on date NOT NULL DEFAULT current_date,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contracts_student_idx
  ON public.contracts (student_id, agreed_on DESC);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('pix', 'cash', 'debit', 'credit')),
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_on date,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'paid' OR paid_on IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS payments_student_idx
  ON public.payments (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_contract_idx
  ON public.payments (contract_id)
  WHERE contract_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.student_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  entity_type text NOT NULL CHECK (char_length(trim(entity_type)) BETWEEN 2 AND 50),
  entity_id uuid,
  action text NOT NULL CHECK (char_length(trim(action)) BETWEEN 2 AND 80),
  actor_email text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_audit_timeline_idx
  ON public.student_audit_log (student_id, created_at DESC);

ALTER TABLE public.booking_reservations
  ADD COLUMN IF NOT EXISTS student_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'booking_reservations_student_id_fkey'
      AND conrelid = 'public.booking_reservations'::regclass
  ) THEN
    ALTER TABLE public.booking_reservations
      ADD CONSTRAINT booking_reservations_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS booking_reservations_student_idx
  ON public.booking_reservations (student_id, starts_at DESC)
  WHERE student_id IS NOT NULL;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.students FROM anon, authenticated;
REVOKE ALL ON TABLE public.license_processes FROM anon, authenticated;
REVOKE ALL ON TABLE public.lessons FROM anon, authenticated;
REVOKE ALL ON TABLE public.student_skill_assessments FROM anon, authenticated;
REVOKE ALL ON TABLE public.student_notes FROM anon, authenticated;
REVOKE ALL ON TABLE public.contracts FROM anon, authenticated;
REVOKE ALL ON TABLE public.payments FROM anon, authenticated;
REVOKE ALL ON TABLE public.student_audit_log FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.student_audit_log_id_seq FROM anon, authenticated;

-- Verificação segura sugerida após aplicar:
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE oid IN (
--   'public.students'::regclass,
--   'public.lessons'::regclass,
--   'public.student_skill_assessments'::regclass,
--   'public.license_processes'::regclass,
--   'public.contracts'::regclass,
--   'public.payments'::regclass,
--   'public.student_notes'::regclass,
--   'public.student_audit_log'::regclass
-- );
