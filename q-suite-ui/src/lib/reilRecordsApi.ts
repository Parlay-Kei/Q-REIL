/**
 * REIL Core Records API (ENGDEL-REIL-RECORDS-UI-0013).
 * Fetches records with search, record detail with ledger events and links.
 */

import { supabase } from './supabase';
import {
  searchRecordsByKeyFields,
  getRecordById,
  getLedgerEventsForEntity,
  getRecordLinksForRecord,
  appendLedgerEvent,
  linkDocumentToRecord,
  listDocuments,
} from './reilDal';
import type { RecordRow, LedgerEventRow, RecordLinkRow, DocumentRow } from '../types/reil-core';
import { REIL_DEFAULT_ORG_ID } from '../constants/inbox';

export type RecordListFilters = {
  titleContains?: string;
  status?: string;
  recordType?: 'property' | 'deal';
  tag?: string;
};

export async function fetchReilRecords(
  filters?: RecordListFilters
): Promise<{ records: RecordRow[]; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) return { records: [], error: new Error('VITE_REIL_ORG_ID not set') };
  const result = await searchRecordsByKeyFields(supabase, REIL_DEFAULT_ORG_ID, {
    titleContains: filters?.titleContains,
    status: filters?.status,
    recordType: filters?.recordType,
    tag: filters?.tag,
    limit: 100,
  });
  if (result.error) return { records: [], error: result.error };
  return { records: result.data!, error: null };
}

export type RecordDetail = {
  record: RecordRow;
  ledgerEvents: LedgerEventRow[];
  links: RecordLinkRow[];
};

export async function fetchReilRecordDetail(
  recordId: string
): Promise<{ detail: RecordDetail | null; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) return { detail: null, error: new Error('VITE_REIL_ORG_ID not set') };
  const [recordRes, ledgerRes, linksRes] = await Promise.all([
    getRecordById(supabase, REIL_DEFAULT_ORG_ID, recordId),
    getLedgerEventsForEntity(supabase, REIL_DEFAULT_ORG_ID, 'record', recordId),
    getRecordLinksForRecord(supabase, REIL_DEFAULT_ORG_ID, recordId),
  ]);
  if (recordRes.error) return { detail: null, error: recordRes.error };
  if (ledgerRes.error) return { detail: null, error: ledgerRes.error };
  if (linksRes.error) return { detail: null, error: linksRes.error };
  const detail: RecordDetail = {
    record: recordRes.data!,
    ledgerEvents: ledgerRes.data!,
    links: linksRes.data!,
  };
  return { detail, error: null };
}

export async function attachDocumentToRecord(
  documentId: string,
  recordId: string,
  linkMethod: 'manual' | 'system' = 'manual',
  linkedBy?: string | null
): Promise<{ ok: boolean; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) return { ok: false, error: new Error('VITE_REIL_ORG_ID not set') };
  const result = await linkDocumentToRecord(supabase, REIL_DEFAULT_ORG_ID, documentId, recordId, linkMethod, { linkedBy });
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, error: null };
}

export async function appendRecordLedgerEvent(
  recordId: string,
  eventType: string,
  payload?: Record<string, unknown>,
  actorId?: string | null
): Promise<{ ok: boolean; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) return { ok: false, error: new Error('VITE_REIL_ORG_ID not set') };
  const result = await appendLedgerEvent(supabase, REIL_DEFAULT_ORG_ID, eventType, 'record', recordId, {
    actorId: actorId ?? null,
    payload: payload ?? {},
  });
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, error: null };
}

export type DocumentsListFilters = {
  documentType?: string;
  limit?: number;
};

export async function fetchReilDocuments(
  filters?: DocumentsListFilters
): Promise<{ documents: DocumentRow[]; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) return { documents: [], error: new Error('VITE_REIL_ORG_ID not set') };
  const result = await listDocuments(supabase, REIL_DEFAULT_ORG_ID, {
    documentType: filters?.documentType,
    limit: filters?.limit ?? 500,
  });
  if (result.error) return { documents: [], error: result.error };
  return { documents: result.data!, error: null };
}
