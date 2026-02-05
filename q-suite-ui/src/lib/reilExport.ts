/**
 * REIL Core CSV and JSON export (ENGDEL-REIL-EXPORTS-0014 / 0015).
 * Exports records, ledger events by record, and documents list. Deterministic ordering by id.
 */

import type { RecordRow, LedgerEventRow, DocumentRow } from '../types/reil-core';

/** Sort rows by id for deterministic export output. */
function sortById<T extends { id: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.id.localeCompare(b.id));
}

const CSV_ESCAPE_RE = /["\r\n]/;

function escapeCsvCell(value: string): string {
  const s = String(value ?? '');
  if (CSV_ESCAPE_RE.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowToCsvLine(cells: string[]): string {
  return cells.map(escapeCsvCell).join(',');
}

/**
 * Export records to CSV (id, org_id, record_type, record_type_id, title, status, owner_id, tags, created_at, updated_at).
 */
export function recordsToCsv(records: RecordRow[]): string {
  const header = [
    'id',
    'org_id',
    'record_type',
    'record_type_id',
    'title',
    'status',
    'owner_id',
    'tags',
    'created_at',
    'updated_at',
  ];
  const lines = [rowToCsvLine(header)];
  const sorted = sortById(records);
  for (const r of sorted) {
    lines.push(
      rowToCsvLine([
        r.id,
        r.org_id,
        r.record_type,
        r.record_type_id,
        r.title,
        r.status,
        r.owner_id ?? '',
        Array.isArray(r.tags) ? r.tags.join(';') : '',
        r.created_at,
        r.updated_at,
      ])
    );
  }
  return lines.join('\r\n');
}

/**
 * Export ledger events for a record to CSV. Includes record_id and record_title for context.
 * Columns: record_id, record_title, id, org_id, actor_id, actor_type, event_type, entity_type, entity_id, payload_json, correlation_id, created_at.
 */
export function ledgerEventsByRecordToCsv(
  recordId: string,
  recordTitle: string,
  events: LedgerEventRow[]
): string {
  const header = [
    'record_id',
    'record_title',
    'id',
    'org_id',
    'actor_id',
    'actor_type',
    'event_type',
    'entity_type',
    'entity_id',
    'payload_json',
    'correlation_id',
    'created_at',
  ];
  const lines = [rowToCsvLine(header)];
  const sorted = sortById(events);
  for (const e of sorted) {
    lines.push(
      rowToCsvLine([
        recordId,
        recordTitle,
        e.id,
        e.org_id,
        e.actor_id ?? '',
        e.actor_type,
        e.event_type,
        e.entity_type,
        e.entity_id,
        JSON.stringify(e.payload ?? {}),
        e.correlation_id ?? '',
        e.created_at,
      ])
    );
  }
  return lines.join('\r\n');
}

/**
 * Export documents list to CSV (id, org_id, created_by_user_id, name, document_type, storage_path, storage_bucket, mime_type, file_size, tags, created_at, updated_at).
 */
export function documentsToCsv(documents: DocumentRow[]): string {
  const header = [
    'id',
    'org_id',
    'created_by_user_id',
    'name',
    'document_type',
    'storage_path',
    'storage_bucket',
    'mime_type',
    'file_size',
    'tags',
    'created_at',
    'updated_at',
  ];
  const lines = [rowToCsvLine(header)];
  const sorted = sortById(documents);
  for (const d of sorted) {
    lines.push(
      rowToCsvLine([
        d.id,
        d.org_id,
        d.created_by_user_id ?? '',
        d.name,
        d.document_type ?? '',
        d.storage_path,
        d.storage_bucket,
        d.mime_type ?? '',
        d.file_size != null ? String(d.file_size) : '',
        Array.isArray(d.tags) ? d.tags.join(';') : '',
        d.created_at,
        d.updated_at,
      ])
    );
  }
  return lines.join('\r\n');
}

/**
 * Trigger browser download of a CSV string with given filename.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export records to JSON (deterministic: sorted by id). Required fields: id, org_id, record_type, record_type_id, title, status, owner_id, tags, created_at, updated_at.
 */
export function recordsToJson(records: RecordRow[]): string {
  const sorted = sortById(records);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Export ledger events to JSON (deterministic: sorted by id). Required fields: id, org_id, actor_id, actor_type, event_type, entity_type, entity_id, payload, correlation_id, created_at.
 */
export function ledgerEventsToJson(events: LedgerEventRow[]): string {
  const sorted = sortById(events);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Export documents list to JSON (deterministic: sorted by id). Required fields: id, org_id, created_by_user_id, name, document_type, storage_path, storage_bucket, mime_type, file_size, tags, created_at, updated_at.
 */
export function documentsToJson(documents: DocumentRow[]): string {
  const sorted = sortById(documents);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Trigger browser download of a JSON string with given filename.
 */
export function downloadJson(jsonContent: string, filename: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
