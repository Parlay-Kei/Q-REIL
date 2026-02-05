/**
 * REIL DAL: Documents (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * createDocumentPointer, linkDocumentToRecord
 */

import type { DalClient, DalResult, Actor } from './types';
import { dalErr, dalOk } from './types';
import type { DocumentRow } from '../../types/reil-core';

export type CreateDocumentPointerParams = {
  source: string;
  external_id: string;
  filename: string;
  mime_type?: string | null;
  byte_size?: number | null;
  storage_path: string;
  sha256?: string | null;
  actor: Actor;
};

/**
 * Create a document pointer (metadata row in documents table).
 * name=filename, file_size=byte_size; source/external_id/sha256 stored in tags.
 */
export async function createDocumentPointer(
  client: DalClient,
  params: CreateDocumentPointerParams
): Promise<DalResult<DocumentRow>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const tags: string[] = [];
  if (params.source) tags.push(`source:${params.source}`);
  if (params.external_id) tags.push(`ext:${params.external_id}`);
  if (params.sha256) tags.push(`sha256:${params.sha256}`);
  const row = {
    org_id: params.actor.org_id,
    created_by_user_id: params.actor.user_id ?? null,
    name: params.filename,
    document_type: params.source,
    storage_path: params.storage_path,
    storage_bucket: 'documents',
    mime_type: params.mime_type ?? null,
    file_size: params.byte_size ?? null,
    tags,
  };
  const { data, error } = await client.from('documents').insert(row).select().single();
  if (error) return dalErr(new Error(error.message));
  return dalOk(data as DocumentRow);
}

export type LinkDocumentToRecordParams = {
  document_id: string;
  record_id: string;
  actor: Actor;
  link_method?: 'rule' | 'manual' | 'system';
};

/**
 * Link a document to a record (record_links: source_type=document, target_type=record).
 */
export async function linkDocumentToRecord(
  client: DalClient,
  params: LinkDocumentToRecordParams
): Promise<DalResult<{ id: string }>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const row = {
    org_id: params.actor.org_id,
    source_type: 'document',
    source_id: params.document_id,
    target_type: 'record',
    target_id: params.record_id,
    link_method: params.link_method ?? 'manual',
    linked_by: params.actor.user_id ?? null,
  };
  const { data, error } = await client
    .from('record_links')
    .insert(row)
    .select('id')
    .single();
  if (error) return dalErr(new Error(error.message));
  return dalOk({ id: (data as { id: string }).id });
}
