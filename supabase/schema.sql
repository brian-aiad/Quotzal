-- ============================================================
-- QUOTZAL — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  brokerage_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  brand_color text,
  phone text,
  address text,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'trialing',
  insurance_types_enabled text[] NOT NULL DEFAULT ARRAY[
    'auto_personal', 'auto_commercial', 'home', 'life',
    'motorcycle', 'boat', 'rv', 'other'
  ],
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE broker_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  link_id uuid NOT NULL REFERENCES broker_links(id) ON DELETE CASCADE,
  insurance_type text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  broker_notes text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  has_current_insurance boolean,
  current_carrier text,
  current_limits text,
  policy_expiry date,
  form_data jsonb NOT NULL DEFAULT '{}',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  scheduled_deletion_at timestamptz,
  deletion_warning_sent_at timestamptz
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  status text NOT NULL,
  stripe_invoice_id text UNIQUE NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  brokerage_name text NOT NULL,
  full_name text NOT NULL,
  phone text,
  demo_slug text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  converted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_submissions_broker_id ON submissions(broker_id);
CREATE INDEX idx_submissions_status ON submissions(broker_id, status);
CREATE INDEX idx_submissions_type ON submissions(broker_id, insurance_type);
CREATE INDEX idx_submissions_submitted_at ON submissions(broker_id, submitted_at DESC);
CREATE INDEX idx_submissions_deletion ON submissions(scheduled_deletion_at)
  WHERE scheduled_deletion_at IS NOT NULL;
CREATE INDEX idx_brokers_stripe_customer ON brokers(stripe_customer_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- brokers: owners can read and update their own row
CREATE POLICY "brokers_select_own"
  ON brokers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "brokers_update_own"
  ON brokers FOR UPDATE
  USING (auth.uid() = id);

-- broker_links: full CRUD for the owning broker
CREATE POLICY "broker_links_select_own"
  ON broker_links FOR SELECT
  USING (auth.uid() = broker_id);

CREATE POLICY "broker_links_insert_own"
  ON broker_links FOR INSERT
  WITH CHECK (auth.uid() = broker_id);

CREATE POLICY "broker_links_update_own"
  ON broker_links FOR UPDATE
  USING (auth.uid() = broker_id);

CREATE POLICY "broker_links_delete_own"
  ON broker_links FOR DELETE
  USING (auth.uid() = broker_id);

-- submissions: broker can read/update/delete; anon can insert (public form)
CREATE POLICY "submissions_select_own"
  ON submissions FOR SELECT
  USING (auth.uid() = broker_id);

CREATE POLICY "submissions_update_own"
  ON submissions FOR UPDATE
  USING (auth.uid() = broker_id);

CREATE POLICY "submissions_delete_own"
  ON submissions FOR DELETE
  USING (auth.uid() = broker_id);

CREATE POLICY "submissions_insert_anon"
  ON submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- payments: broker can read their own
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (auth.uid() = broker_id);

-- ============================================================
-- TRIGGER: Global slug uniqueness across tables
-- ============================================================

CREATE OR REPLACE FUNCTION check_global_slug_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM brokers WHERE slug = NEW.slug) THEN
    RAISE EXCEPTION 'Slug "%" is already taken by a broker', NEW.slug;
  END IF;

  IF EXISTS (SELECT 1 FROM demo_requests WHERE demo_slug = NEW.slug) THEN
    RAISE EXCEPTION 'Slug "%" is already taken by a demo request', NEW.slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_broker_links_global_slug
  BEFORE INSERT OR UPDATE ON broker_links
  FOR EACH ROW
  EXECUTE FUNCTION check_global_slug_uniqueness();
