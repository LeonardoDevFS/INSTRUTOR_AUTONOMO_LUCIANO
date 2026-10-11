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
  duplicate_confirmed_at timestamptz,
  duplicate_confirmed_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NULL OR char_length(trim(email)) BETWEEN 5 AND 160),
  CHECK (email_normalized IS NULL OR email_normalized = lower(email_normalized)),
  CONSTRAINT students_duplicate_confirmation_check CHECK (
    (duplicate_confirmed_at IS NULL AND duplicate_confirmed_by IS NULL)
    OR (
      duplicate_confirmed_at IS NOT NULL
      AND duplicate_confirmed_by IS NOT NULL
      AND char_length(trim(duplicate_confirmed_by)) BETWEEN 5 AND 160
    )
  )
);

-- Índice de detecção, não de bloqueio: uma duplicidade pode ser mantida somente
-- quando o administrador registra a confirmação explícita exigida pelo trigger.
CREATE INDEX IF NOT EXISTS students_identity_lookup_idx
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
  booking_reservation_id uuid,
  google_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lessons_id_student_unique UNIQUE (id, student_id)
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
  lesson_id uuid,
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
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contracts_id_student_unique UNIQUE (id, student_id)
);

CREATE INDEX IF NOT EXISTS contracts_student_idx
  ON public.contracts (student_id, agreed_on DESC);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  contract_id uuid,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'booking_reservations_id_student_unique'
      AND conrelid = 'public.booking_reservations'::regclass
  ) THEN
    ALTER TABLE public.booking_reservations
      ADD CONSTRAINT booking_reservations_id_student_unique
      UNIQUE (id, student_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lessons_booking_student_fkey'
      AND conrelid = 'public.lessons'::regclass
  ) THEN
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_booking_student_fkey
      FOREIGN KEY (booking_reservation_id, student_id)
      REFERENCES public.booking_reservations (id, student_id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'student_skills_lesson_student_fkey'
      AND conrelid = 'public.student_skill_assessments'::regclass
  ) THEN
    ALTER TABLE public.student_skill_assessments
      ADD CONSTRAINT student_skills_lesson_student_fkey
      FOREIGN KEY (lesson_id, student_id)
      REFERENCES public.lessons (id, student_id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payments_contract_student_fkey'
      AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_contract_student_fkey
      FOREIGN KEY (contract_id, student_id)
      REFERENCES public.contracts (id, student_id)
      ON DELETE RESTRICT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS booking_reservations_student_idx
  ON public.booking_reservations (student_id, starts_at DESC)
  WHERE student_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.direcao_segura_enforce_student_duplicates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  duplicate_exists boolean;
BEGIN
  IF NEW.archived_at IS NOT NULL THEN
    NEW.duplicate_confirmed_at := NULL;
    NEW.duplicate_confirmed_by := NULL;
    RETURN NEW;
  END IF;

  -- Serializa tentativas da mesma identidade para evitar corrida entre duas
  -- requisições concorrentes antes da verificação.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(lower(btrim(NEW.full_name)) || ':' || NEW.phone_normalized, 0)
  );

  SELECT EXISTS (
    SELECT 1
    FROM public.students existing
    WHERE existing.id <> NEW.id
      AND existing.archived_at IS NULL
      AND lower(btrim(existing.full_name)) = lower(btrim(NEW.full_name))
      AND existing.phone_normalized = NEW.phone_normalized
  ) INTO duplicate_exists;

  IF duplicate_exists AND (
    NEW.duplicate_confirmed_at IS NULL
    OR NEW.duplicate_confirmed_by IS NULL
    OR (
      TG_OP = 'UPDATE'
      AND (
        lower(btrim(NEW.full_name)) IS DISTINCT FROM lower(btrim(OLD.full_name))
        OR NEW.phone_normalized IS DISTINCT FROM OLD.phone_normalized
      )
      AND NEW.duplicate_confirmed_at IS NOT DISTINCT FROM OLD.duplicate_confirmed_at
      AND NEW.duplicate_confirmed_by IS NOT DISTINCT FROM OLD.duplicate_confirmed_by
    )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23505',
      CONSTRAINT = 'students_duplicate_confirmation_required',
      MESSAGE = 'duplicate student requires administrative confirmation';
  ELSIF NOT duplicate_exists THEN
    NEW.duplicate_confirmed_at := NULL;
    NEW.duplicate_confirmed_by := NULL;
  END IF;

  RETURN NEW;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'students_enforce_duplicate_confirmation'
      AND tgrelid = 'public.students'::regclass
  ) THEN
    CREATE TRIGGER students_enforce_duplicate_confirmation
      BEFORE INSERT OR UPDATE OF full_name, phone_normalized, archived_at,
        duplicate_confirmed_at, duplicate_confirmed_by
      ON public.students
      FOR EACH ROW
      EXECUTE FUNCTION public.direcao_segura_enforce_student_duplicates();
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.direcao_segura_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;

DO $$
DECLARE
  target_table regclass;
  target_name text;
  target_trigger_name text;
BEGIN
  FOREACH target_name IN ARRAY ARRAY[
    'students',
    'license_processes',
    'lessons',
    'contracts',
    'payments',
    'booking_reservations'
  ] LOOP
    target_table := to_regclass('public.' || target_name);
    target_trigger_name := target_name || '_touch_updated_at';
    IF target_table IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_trigger AS existing_trigger
      WHERE existing_trigger.tgname = target_trigger_name
        AND existing_trigger.tgrelid = target_table
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION public.direcao_segura_touch_updated_at()',
        target_trigger_name,
        target_table
      );
    END IF;
  END LOOP;
END
$$;

REVOKE ALL ON FUNCTION public.direcao_segura_enforce_student_duplicates()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.direcao_segura_touch_updated_at()
  FROM PUBLIC, anon, authenticated;

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
