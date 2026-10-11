-- Direção Segura — agendamento público no Supabase PostgreSQL.
-- Migração aditiva e idempotente: não apaga tabelas nem registros existentes.
-- Revise primeiro no SQL Editor do projeto "Luciano Direção Segura".

CREATE TABLE IF NOT EXISTS public.booking_reservations (
  id uuid PRIMARY KEY,
  idempotency_key uuid NOT NULL UNIQUE,
  slot_key text UNIQUE,
  service_id text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL CHECK (
    status IN ('holding', 'confirmed', 'failed', 'cancelled')
  ),
  google_event_id text UNIQUE,
  hold_expires_at timestamptz,
  calendar_sync_status text NOT NULL DEFAULT 'pending',
  sync_attempts integer NOT NULL DEFAULT 0,
  last_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_calendar_sync_status_check CHECK (
    calendar_sync_status IN ('pending', 'synced', 'cancel_pending', 'error')
  ),
  CONSTRAINT booking_sync_attempts_check CHECK (sync_attempts >= 0),
  CHECK (ends_at > starts_at)
);

-- Compatibilidade aditiva caso a primeira versão da tabela já tenha sido criada.
ALTER TABLE public.booking_reservations
  ADD COLUMN IF NOT EXISTS calendar_sync_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sync_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_sync_error text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'booking_calendar_sync_status_check'
      AND conrelid = 'public.booking_reservations'::regclass
  ) THEN
    ALTER TABLE public.booking_reservations
      ADD CONSTRAINT booking_calendar_sync_status_check CHECK (
        calendar_sync_status IN ('pending', 'synced', 'cancel_pending', 'error')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'booking_sync_attempts_check'
      AND conrelid = 'public.booking_reservations'::regclass
  ) THEN
    ALTER TABLE public.booking_reservations
      ADD CONSTRAINT booking_sync_attempts_check CHECK (sync_attempts >= 0);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS booking_reservations_range_idx
  ON public.booking_reservations (starts_at, ends_at)
  WHERE status IN ('holding', 'confirmed');

CREATE INDEX IF NOT EXISTS booking_reservations_reconciliation_idx
  ON public.booking_reservations (updated_at)
  WHERE status = 'holding'
     OR (status = 'cancelled' AND calendar_sync_status = 'cancel_pending');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'booking_no_overlapping_active'
      AND conrelid = 'public.booking_reservations'::regclass
  ) THEN
    ALTER TABLE public.booking_reservations
      ADD CONSTRAINT booking_no_overlapping_active
      EXCLUDE USING gist (
        tstzrange(starts_at, ends_at, '[)') WITH &&
      )
      WHERE (status IN ('holding', 'confirmed'));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  key_hash text NOT NULL,
  bucket_start timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0),
  PRIMARY KEY (key_hash, bucket_start)
);

-- As rotas Next.js usam a conexão PostgreSQL privada. Nada destas tabelas é
-- disponibilizado diretamente ao navegador pela Data API do Supabase.
ALTER TABLE public.booking_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.booking_reservations FROM anon, authenticated;
REVOKE ALL ON TABLE public.booking_rate_limits FROM anon, authenticated;

-- Verificação esperada: relrowsecurity = true para as duas tabelas.
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE oid IN (
--   'public.booking_reservations'::regclass,
--   'public.booking_rate_limits'::regclass
-- );

-- Retenção técnica manual sugerida; revise a política antes de executar.
-- DELETE FROM public.booking_rate_limits
-- WHERE bucket_start < now() - interval '2 days';
