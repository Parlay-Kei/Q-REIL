/**
 * REIL Core Inbox API (ENGDEL-REIL-INBOX-UI-0012).
 * Fetches raw items with normalized status and maps to UI shapes.
 */

import { supabase } from './supabase';
import {
  listRawItemsWithNormalizedStatus,
  getRawItemById,
  getNormalizedItemByKey,
  getRecordLinksBySource,
  getRecordById,
} from './reilDal';
import type { InboxItemRow, InboxItemDetail } from '../types/reil-core';
import { REIL_DEFAULT_ORG_ID } from '../constants/inbox';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function payloadToDisplay(payload: Record<string, unknown>): {
  sender: string;
  date: string;
  type: string;
  reviewRequired: boolean;
  subject: string;
  preview: string;
  hasAttachments: boolean;
  attachmentCount: number;
} {
  const from = (payload?.from as string) ?? (payload?.from_email as string) ?? '';
  const name = (payload?.from_name as string) ?? from.split('@')[0] ?? 'Unknown';
  const sender = name && from ? `${name} <${from}>` : from || 'Unknown';
  const created = (payload?.created_at as string) ?? (payload?.date as string) ?? '';
  const date = created ? formatTimestamp(created) : '';
  const type = (payload?.type as string) ?? (payload?.normalized_type as string) ?? 'message';
  const reviewRequired = (payload?.review_required as boolean) === true;
  const subject = (payload?.subject as string) ?? (payload?.title as string) ?? '(No subject)';
  const snippet = (payload?.snippet as string) ?? (payload?.body_plain as string) ?? '';
  const preview = typeof snippet === 'string' ? snippet.slice(0, 120) : '';
  const attMeta = (payload?.attachment_metadata as { length?: number }[]) ?? (payload?.attachments as unknown[]) ?? [];
  const attachmentCount = Array.isArray(attMeta) ? attMeta.length : 0;
  const hasAttachments = attachmentCount > 0;
  return {
    sender,
    date,
    type,
    reviewRequired,
    subject,
    preview,
    hasAttachments,
    attachmentCount,
  };
}

function payloadToParsed(payload: Record<string, unknown>): InboxItemDetail['parsed'] {
  const subject = (payload?.subject as string) ?? (payload?.title as string);
  const from = (payload?.from as string) ?? (payload?.from_email as string);
  const fromName = (payload?.from_name as string) ?? from?.split('@')[0];
  const to = (payload?.to as string[]) ?? (payload?.to_emails as string[]) ?? [];
  const date = (payload?.date as string) ?? (payload?.sent_at as string) ?? (payload?.created_at as string);
  const body = (payload?.body_plain as string) ?? (payload?.body as string);
  const snippet = (payload?.snippet as string);
  return {
    subject,
    from: fromName ?? from,
    fromEmail: from,
    to: Array.isArray(to) ? to : [],
    date: date ? new Date(date).toLocaleString() : undefined,
    body,
    snippet,
  };
}

function payloadToAttachments(payload: Record<string, unknown>): InboxItemDetail['attachments'] {
  const attMeta = (payload?.attachment_metadata as { filename?: string; mimeType?: string; size?: number }[]) ??
    (payload?.attachments as { name?: string; type?: string; size?: string }[]) ?? [];
  if (!Array.isArray(attMeta)) return [];
  return attMeta.map((a) => ({
    name: (a as { filename?: string }).filename ?? (a as { name?: string }).name ?? 'attachment',
    type: (a as { mimeType?: string }).mimeType ?? (a as { type?: string }).type,
    size: (a as { size?: number }).size != null ? String((a as { size: number }).size) : (a as { size?: string }).size,
    documentId: (a as { document_id?: string }).document_id,
  }));
}

export type InboxFilters = {
  sender?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  reviewRequired?: boolean;
};

export async function fetchReilInboxItems(
  filters?: InboxFilters
): Promise<{ items: InboxItemRow[]; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) {
    return { items: [], error: new Error('VITE_REIL_ORG_ID not set') };
  }
  const result = await listRawItemsWithNormalizedStatus(supabase, REIL_DEFAULT_ORG_ID, {
    senderContains: filters?.sender,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo,
    sourceType: filters?.type,
    reviewRequired: filters?.reviewRequired,
    limit: 100,
  });
  if (result.error) return { items: [], error: result.error };
  const combined = result.data!;
  const rawIds = combined.map(({ raw }) => raw.id);
  const linksResult = await getRecordLinksBySource(supabase, REIL_DEFAULT_ORG_ID, 'message', rawIds);
  const links = linksResult.error ? [] : linksResult.data!;
  const recordIds = [...new Set(links.map((l) => l.target_id))];
  const recordMap: Record<string, string> = {};
  await Promise.all(
    recordIds.map(async (id) => {
      const r = await getRecordById(supabase, REIL_DEFAULT_ORG_ID, id);
      if (!r.error && r.data) recordMap[id] = r.data.title;
    })
  );
  const linkBySource: Record<string, (typeof links)[0]> = {};
  links.forEach((l) => {
    if (l.target_type === 'record' && !linkBySource[l.source_id]) linkBySource[l.source_id] = l;
  });
  const items: InboxItemRow[] = combined.map(({ raw, normalized }) => {
    const disp = payloadToDisplay(raw.payload);
    const link = linkBySource[raw.id];
    const matchStatus =
      (normalized?.payload?.match_status as string) ??
      (normalized ? 'matched' : null);
    const itemConfidence =
      (normalized?.payload?.item_confidence as number) ??
      (normalized?.payload?.match_confidence as number) ??
      null;
    return {
      id: raw.id,
      idempotencyKey: raw.idempotency_key,
      sourceType: raw.source_type,
      normalized: !!normalized,
      normalizedType: normalized?.normalized_type ?? null,
      createdAt: raw.created_at,
      sender: disp.sender,
      date: disp.date || formatTimestamp(raw.created_at),
      type: disp.type,
      reviewRequired: disp.reviewRequired,
      subject: disp.subject,
      preview: disp.preview,
      hasAttachments: disp.hasAttachments,
      attachmentCount: disp.attachmentCount,
      linkedRecord: link
        ? { type: 'Record', name: recordMap[link.target_id] ?? link.target_id }
        : null,
      matchStatus: matchStatus ?? null,
      itemConfidence: itemConfidence != null ? itemConfidence : null,
    };
  });
  return { items, error: null };
}

export async function fetchReilInboxItemDetail(
  rawId: string
): Promise<{ item: InboxItemDetail | null; error: Error | null }> {
  if (!REIL_DEFAULT_ORG_ID) {
    return { item: null, error: new Error('VITE_REIL_ORG_ID not set') };
  }
  const rawResult = await getRawItemById(supabase, REIL_DEFAULT_ORG_ID, rawId);
  if (rawResult.error) return { item: null, error: rawResult.error };
  const raw = rawResult.data!;
  const normResult = await getNormalizedItemByKey(supabase, REIL_DEFAULT_ORG_ID, raw.idempotency_key);
  const normalized = normResult.data ?? null;
  const payload = raw.payload ?? {};
  const matchStatus =
    (normalized?.payload?.match_status as string) ?? (normalized ? 'matched' : null);
  const itemConfidence =
    (normalized?.payload?.item_confidence as number) ??
    (normalized?.payload?.match_confidence as number) ??
    null;
  const linksResult = await getRecordLinksBySource(supabase, REIL_DEFAULT_ORG_ID, 'message', [raw.id]);
  const links = linksResult.error ? [] : linksResult.data!.filter((l) => l.target_type === 'record');
  const linkedRecords: InboxItemDetail['linkedRecords'] = [];
  for (const l of links) {
    const rec = await getRecordById(supabase, REIL_DEFAULT_ORG_ID, l.target_id);
    linkedRecords.push({
      recordId: l.target_id,
      recordTitle: rec.data?.title ?? l.target_id,
      linkedAt: l.linked_at,
    });
  }
  const item: InboxItemDetail = {
    id: raw.id,
    idempotencyKey: raw.idempotency_key,
    sourceType: raw.source_type,
    normalized: !!normalized,
    normalizedType: normalized?.normalized_type ?? null,
    createdAt: raw.created_at,
    payload,
    parsed: payloadToParsed(payload),
    attachments: payloadToAttachments(payload),
    matchStatus: matchStatus ?? null,
    itemConfidence: itemConfidence != null ? itemConfidence : null,
    linkedRecords,
  };
  return { item, error: null };
}
