// ============================================================
// Dashboard Types
// ============================================================

export type SubmissionStatus = 'intake' | 'reviewing' | 'quoted' | 'bound' | 'declined' | 'archived';

export interface SubmissionRow {
  id: string;
  broker_id: string;
  link_id: string;
  insurance_type: string;
  status: SubmissionStatus;
  broker_notes: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  has_current_insurance: boolean | null;
  current_carrier: string | null;
  current_limits: string | null;
  policy_expiry: string | null;
  tags: Array<{ text: string; color: string }> | null;
  form_data: Record<string, unknown>;
  submitted_at: string;
}

export interface BrokerProfile {
  id: string;
  email: string;
  brokerage_name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  phone: string | null;
  address: string | null;
  plan: 'starter' | 'pro';
  status: string;
  insurance_types_enabled: string[];
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  newCount: number;
  thisMonth: number;
  quotedThisMonth: number;
  accountStatus: string;
}

export interface WeeklyCount {
  week: string;
  count: number;
}

export interface TypeBreakdown {
  type: string;
  label: string;
  count: number;
}

export interface ChartData {
  weekly: WeeklyCount[];
  byType: TypeBreakdown[];
}
