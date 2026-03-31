// ============================================================
// Application Constants
// ============================================================

// Time periods
export const TRIAL_DAYS = 30;
export const STARTER_RETENTION_MONTHS = 12;
export const PRO_RETENTION_MONTHS = 24;

// Feature limits
export const MAX_CUSTOM_FIELDS = 10;
export const MAX_LINK_ALIASES_PRO = 20;

// Pagination
export const SUBMISSIONS_PER_PAGE = 20;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 10;

// Input length limits
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PHONE_LENGTH = 20;
export const VIN_LENGTH = 17;
export const MAX_ADDRESS_LENGTH = 300;
export const MAX_CARRIER_NAME_LENGTH = 200;
export const MAX_NOTES_LENGTH = 2000;
export const MAX_BROKER_NOTES_LENGTH = 5000;
export const MAX_BROKERAGE_NAME_LENGTH = 100;
export const MAX_SLUG_LENGTH = 50;

// Renewal tracker
export const RENEWAL_WINDOW_DAYS = 90;

// Status pipeline
export const SUBMISSION_STATUSES = ['intake', 'reviewing', 'quoted', 'bound', 'declined', 'archived'] as const;
export type SubmissionStatusType = typeof SUBMISSION_STATUSES[number];

// Tag colors
export const TAG_COLORS = ['gray', 'emerald', 'amber', 'red', 'blue', 'purple'] as const;
export type TagColor = typeof TAG_COLORS[number];

// Preset tags
export const PRESET_TAGS = ['Hot Lead', 'Needs Docs', 'Bundled', 'Follow Up', 'Waiting'] as const;
