/**
 * REIL Core canonical types (PRODOPS-REIL-CORE-SCHEMA-0002).
 * Align with docs/reil-core/CANONICAL_DATA_MODEL.md
 */

export type RecordType = 'property' | 'deal';

export type SourceItemRawRow = {
  id: string;
  org_id: string;
  idempotency_key: string;
  source_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type SourceItemNormalizedRow = {
  id: string;
  org_id: string;
  idempotency_key: string;
  source_type: string;
  normalized_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type RecordRow = {
  id: string;
  org_id: string;
  record_type: RecordType;
  record_type_id: string;
  title: string;
  status: string;
  owner_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  org_id: string;
  created_by_user_id: string | null;
  name: string;
  document_type: string | null;
  storage_path: string;
  storage_bucket: string;
  mime_type: string | null;
  file_size: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type LedgerEventRow = {
  id: string;
  org_id: string;
  actor_id: string | null;
  actor_type: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  correlation_id: string | null;
  created_at: string;
};

export type RecordLinkRow = {
  id: string;
  org_id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  link_method: 'rule' | 'manual' | 'system';
  linked_by: string | null;
  linked_at: string;
};

/** UI: raw inbox item with normalized status (for Inbox list). */
export type InboxItemRow = {
  id: string;
  idempotencyKey: string;
  sourceType: string;
  normalized: boolean;
  normalizedType: string | null;
  createdAt: string;
  /** From payload: sender display */
  sender: string;
  /** From payload: date display or created_at */
  date: string;
  /** From payload: type/category */
  type: string;
  reviewRequired: boolean;
  subject: string;
  preview: string;
  hasAttachments: boolean;
  attachmentCount: number;
  linkedRecord: { type: string; name: string } | null;
  /** From normalized payload: match_status (e.g. matched, unmatched) */
  matchStatus: string | null;
  /** From normalized payload: item_confidence / match_confidence 0–1 */
  itemConfidence: number | null;
};

/** UI: raw item detail with parsed fields and attachments. */
export type InboxItemDetail = {
  id: string;
  idempotencyKey: string;
  sourceType: string;
  normalized: boolean;
  normalizedType: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
  /** Parsed display fields from payload (e.g. subject, from, to, body, date). */
  parsed: {
    subject?: string;
    from?: string;
    fromEmail?: string;
    to?: string[];
    date?: string;
    body?: string;
    snippet?: string;
  };
  attachments: { name: string; type?: string; size?: string; documentId?: string }[];
  /** From normalized payload */
  matchStatus: string | null;
  itemConfidence: number | null;
  /** Existing record links (source = this item) */
  linkedRecords: { recordId: string; recordTitle: string; linkedAt: string }[];
};

/** Insert shapes (omit id, created_at where generated) */
export type InsertSourceItemRaw = Omit<SourceItemRawRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type UpsertSourceItemNormalized = Omit<SourceItemNormalizedRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
export type InsertRecord = Omit<RecordRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
export type InsertLedgerEvent = Omit<LedgerEventRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type InsertRecordLink = Omit<RecordLinkRow, 'id' | 'linked_at'> & { id?: string; linked_at?: string };
