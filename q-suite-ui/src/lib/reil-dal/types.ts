/**
 * REIL DAL shared types (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * Actor carries org context; optional user_id for audit.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type DalClient = SupabaseClient | null;

export type Actor = {
  org_id: string;
  user_id?: string | null;
};

export type DalResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export function dalErr<E extends Error>(e: E): { data: null; error: E } {
  return { data: null, error: e };
}

export function dalOk<T>(data: T): { data: T; error: null } {
  return { data, error: null };
}
