/**
 * Single flag for REIL Inbox/Thread data source.
 * - false or unset: read from Supabase (default).
 * - true: use seed/mock data (dev fallback only).
 */
export const USE_INBOX_SEED_DATA =
  import.meta.env.VITE_USE_INBOX_SEED_DATA === 'true';

/**
 * When true, Inbox list uses REIL Core (source_items_raw + normalized status).
 * When false, Inbox uses mail_threads (legacy).
 */
export const USE_REIL_CORE_INBOX =
  import.meta.env.VITE_USE_REIL_CORE_INBOX === 'true';

/** Default org_id for REIL Core queries when not in a multi-org context. Set VITE_REIL_ORG_ID. */
export const REIL_DEFAULT_ORG_ID =
  import.meta.env.VITE_REIL_ORG_ID ?? '';
