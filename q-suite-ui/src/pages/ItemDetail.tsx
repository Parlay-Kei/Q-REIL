/**
 * REIL Core Inbox Item Detail (ENGDEL-REIL-INBOX-UI-0012).
 * Open item detail with parsed fields and attachments from source_items_raw.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  ArrowLeftIcon,
  PaperclipIcon,
  FileTextIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  LinkIcon,
  CheckIcon,
  BriefcaseIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { fetchReilInboxItemDetail } from '../lib/reilInboxApi';
import { linkSourceItemToRecord, searchRecordsByKeyFields } from '../lib/reilDal';
import { supabase } from '../lib/supabase';
import { REIL_DEFAULT_ORG_ID } from '../constants/inbox';
import type { InboxItemDetail } from '../types/reil-core';
import type { RecordRow } from '../types/reil-core';

const attachmentIcons: Record<string, typeof FileTextIcon> = {
  pdf: FileTextIcon,
  xlsx: FileSpreadsheetIcon,
  docx: FileTextIcon,
  png: ImageIcon,
  jpg: ImageIcon,
};

export function ItemDetail() {
  const navigate = useNavigate();
  const { rawId } = useParams<{ rawId: string }>();
  const [item, setItem] = useState<InboxItemDetail | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  const [suggestedRecords, setSuggestedRecords] = useState<RecordRow[]>([]);
  const [linkBusy, setLinkBusy] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW('Item');
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  useEffect(() => {
    if (!rawId) {
      setLoadState('notfound');
      return;
    }
    setLoadState('loading');
    fetchReilInboxItemDetail(rawId).then(({ item: i, error }) => {
      if (error) {
        setItem(null);
        setLoadState('error');
        return;
      }
      setItem(i ?? null);
      setLoadState(i ? 'ready' : 'notfound');
    });
  }, [rawId]);

  useEffect(() => {
    if (!REIL_DEFAULT_ORG_ID || !supabase) return;
    searchRecordsByKeyFields(supabase, REIL_DEFAULT_ORG_ID, { limit: 20 }).then((res) => {
      if (!res.error && res.data) setSuggestedRecords(res.data);
    });
  }, []);

  const linkRecord = async (recordId: string) => {
    if (!item || !REIL_DEFAULT_ORG_ID || !supabase) return;
    setLinkError(null);
    setLinkBusy(recordId);
    const result = await linkSourceItemToRecord(
      supabase,
      REIL_DEFAULT_ORG_ID,
      'message',
      item.id,
      recordId,
      'manual'
    );
    setLinkBusy(null);
    if (result.error) {
      setLinkError(result.error.message);
      return;
    }
    const { item: i } = await fetchReilInboxItemDetail(item.id);
    if (i) setItem(i);
  };

  if (loadState === 'loading' || loadState === 'notfound') {
    return (
      <div className="h-full flex flex-col p-6">
        <ReilBreadcrumb items={[{ label: 'Inbox', path: '/reil/inbox' }, { label: 'Item' }]} className="mb-3" />
        <button
          onClick={() => navigate('/reil/inbox')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Inbox</span>
        </button>
        {loadState === 'loading' && <p className="text-text-tertiary">Loading item…</p>}
        {loadState === 'notfound' && (
          <EmptyState
            icon={FileTextIcon}
            title="Item not found"
            description="This raw item may have been removed or the link is invalid."
            action={{ label: 'Back to Inbox', onClick: () => navigate('/reil/inbox') }}
          />
        )}
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="h-full flex flex-col p-6">
        <ReilBreadcrumb items={[{ label: 'Inbox', path: '/reil/inbox' }, { label: 'Item' }]} className="mb-3" />
        <button
          onClick={() => navigate('/reil/inbox')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Inbox</span>
        </button>
        <ErrorState
          title="Failed to load item"
          description="We couldn't load this item from the database. Check Supabase and VITE_REIL_ORG_ID."
          onRetry={() => rawId && fetchReilInboxItemDetail(rawId).then(({ item: i, error }) => {
            if (!error && i) {
              setItem(i);
              setLoadState('ready');
            }
          })}
        />
      </div>
    );
  }

  if (!item) return null;

  const { parsed, attachments, payload, normalized, normalizedType, sourceType, idempotencyKey, createdAt, matchStatus, itemConfidence, linkedRecords } = item;
  const linkedRecordIds = new Set(linkedRecords.map((r) => r.recordId));

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl shrink-0">
        <ReilBreadcrumb
          items={[{ label: 'Inbox', path: '/reil/inbox' }, { label: 'Item' }]}
          className="mb-3"
        />
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/reil/inbox')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeftIcon size={18} />
            <span className="text-sm">Back to Inbox</span>
          </button>
        </div>

        <h1 className="text-xl font-semibold text-text-primary mb-2">
          {parsed.subject ?? '(No subject)'}
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          {normalized ? (
            <Badge color="success" size="sm" dot>Normalized</Badge>
          ) : (
            <Badge color="warning" size="sm">Raw</Badge>
          )}
          <Badge color="neutral" size="sm">{sourceType}</Badge>
          {normalizedType && <Badge color="neutral" size="sm">{normalizedType}</Badge>}
          {matchStatus != null && (
            <Badge color="neutral" size="sm">Match: {matchStatus}</Badge>
          )}
          {itemConfidence != null && (
            <span className="text-sm text-text-tertiary">Conf: {Math.round(itemConfidence * 100)}%</span>
          )}
          <div className="flex items-center gap-1 text-text-tertiary">
            <PaperclipIcon size={14} />
            <span className="text-sm">{attachments.length} attachments</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl space-y-6">
            {/* Parsed fields */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Parsed fields</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {parsed.from != null && (
                  <>
                    <dt className="text-text-tertiary">From</dt>
                    <dd className="text-text-primary">{parsed.from}{parsed.fromEmail ? ` <${parsed.fromEmail}>` : ''}</dd>
                  </>
                )}
                {parsed.to != null && parsed.to.length > 0 && (
                  <>
                    <dt className="text-text-tertiary">To</dt>
                    <dd className="text-text-primary">{parsed.to.join(', ')}</dd>
                  </>
                )}
                {parsed.date != null && (
                  <>
                    <dt className="text-text-tertiary">Date</dt>
                    <dd className="text-text-primary">{parsed.date}</dd>
                  </>
                )}
                {parsed.subject != null && (
                  <>
                    <dt className="text-text-tertiary">Subject</dt>
                    <dd className="text-text-primary">{parsed.subject}</dd>
                  </>
                )}
              </dl>
              {(parsed.snippet ?? parsed.body) && (
                <div className="mt-4 pt-4 border-t border-stroke-hairline">
                  <dt className="text-text-tertiary text-sm mb-1">Body / Snippet</dt>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary bg-transparent p-0 m-0">
                    {(parsed.snippet ?? parsed.body) ?? ''}
                  </pre>
                </div>
              )}
            </Card>

            {/* Attachments */}
            {attachments.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Attachments ({attachments.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, i) => {
                    const Icon = attachmentIcons[att.type ?? ''] ?? FileTextIcon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Icon size={16} className="text-text-tertiary" />
                        <span className="text-sm text-text-primary">{att.name}</span>
                        {att.size != null && <span className="text-xs text-text-quaternary">{att.size}</span>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Raw payload (collapsible) */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-2">Raw payload</h3>
              <pre className="text-xs font-mono text-text-tertiary overflow-x-auto bg-bg-deep p-3 rounded-lg max-h-48 overflow-y-auto">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </Card>
          </div>
        </div>

        {/* Right panel: linked records + link to record + audit */}
        <div className="w-80 border-l border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl overflow-y-auto shrink-0">
          <div className="p-5">
            {linkedRecords.length > 0 && (
              <>
                <h3 className="font-semibold text-text-primary mb-2">Linked records</h3>
                <ul className="space-y-2 mb-4">
                  {linkedRecords.map((r) => (
                    <li key={r.recordId} className="flex items-center gap-2 text-sm">
                      <CheckIcon size={14} className="text-success shrink-0" />
                      <button
                        type="button"
                        onClick={() => navigate(`/reil/records/${r.recordId}`)}
                        className="text-accent-cyan hover:underline truncate"
                      >
                        {r.recordTitle}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h3 className="font-semibold text-text-primary mb-4">Link to record</h3>
            <p className="text-sm text-text-tertiary mb-4">Select a record to link this message to. Writes record_links and appends a ledger event.</p>
            {linkError && (
              <p className="text-sm text-danger mb-2">{linkError}</p>
            )}
            <div className="space-y-3">
              {suggestedRecords.map((record) => {
                const isLinked = linkedRecordIds.has(record.id);
                const busy = linkBusy === record.id;
                return (
                  <div
                    key={record.id}
                    className={`p-4 rounded-xl border transition-all ${isLinked ? 'bg-success-dim border-success/30' : 'bg-surface-elevated border-stroke-hairline hover:border-stroke-subtle'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${isLinked ? 'bg-success/20' : 'bg-surface-hover'}`}>
                        <BriefcaseIcon size={16} className={isLinked ? 'text-success' : 'text-text-tertiary'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs text-text-tertiary">{record.record_type}</span>
                          <Badge color="neutral" size="sm">{record.status}</Badge>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">{record.title}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLinked || !!busy}
                      onClick={() => linkRecord(record.id)}
                      className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLinked ? 'bg-success/20 text-success cursor-default' : 'bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20'}`}
                    >
                      {busy ? 'Linking…' : isLinked ? <><CheckIcon size={14} /> Linked</> : <><LinkIcon size={14} /> Link to record</>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-stroke-hairline">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Audit</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">ID</span>
                  <span className="font-mono text-text-quaternary truncate max-w-[140px]" title={item.id}>{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Idempotency key</span>
                  <span className="font-mono text-text-quaternary truncate max-w-[140px]" title={idempotencyKey}>{idempotencyKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Created</span>
                  <span className="text-text-quaternary">{new Date(createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Source</span>
                  <span className="text-text-quaternary">{sourceType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
