BEGIN;

ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
UPDATE public.submissions SET status = 'intake' WHERE status = 'new';
UPDATE public.submissions SET status = 'reviewing' WHERE status = 'reviewed';
ALTER TABLE public.submissions ALTER COLUMN status SET DEFAULT 'intake';
ALTER TABLE public.submissions ADD CONSTRAINT submissions_status_check
  CHECK (status IN ('intake', 'reviewing', 'quoted', 'bound', 'declined', 'archived'));
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;

-- Intake validation and rate limiting must not be bypassed through the Data API.
DROP POLICY IF EXISTS submissions_insert_anon ON public.submissions;
REVOKE INSERT ON public.submissions FROM anon, authenticated;

COMMIT;
