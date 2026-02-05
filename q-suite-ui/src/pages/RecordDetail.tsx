/**
 * REIL Core Record Detail (ENGDEL-REIL-RECORDS-UI-0013).
 * Record detail with timeline from ledger events, attached docs, linked contacts,
 * manual attach and manual override actions (with ledger events).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  ArrowLeftIcon,
  FileTextIcon,
  LinkIcon,
  UserIcon,
  PaperclipIcon,
  PlusIcon,
  RefreshCwIcon,
  EditIcon,
  MoreHorizontalIcon,
  BriefcaseIcon,
  HomeIcon,
  DownloadIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Timeline } from '../components/ui/Timeline';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import {
  fetchReilRecordDetail,
  appendRecordLedgerEvent,
  attachDocumentToRecord,
} from '../lib/reilRecordsApi';
import { getDocumentById } from '../lib/reilDal';
import { supabase } from '../lib/supabase';
import { REIL_DEFAULT_ORG_ID } from '../constants/inbox';
import { ledgerEventsByRecordToCsv, ledgerEventsToJson, downloadCsv, downloadJson } from '../lib/reilExport';
import type { LedgerEventRow } from '../types/reil-core';
import type { TimelineEvent } from '../components/ui/Timeline';

function ledgerToTimelineEvent(ev: LedgerEventRow): TimelineEvent {
  const typeMap: Record<string, TimelineEvent['type']> = {
    document: 'document',
    document_attached: 'document',
    link: 'link',
    record_linked: 'link',
    user: 'user',
    deal: 'deal',
    record: 'deal',
    record_created: 'deal',
    record_updated: 'deal',
    'record.override': 'user',
    override: 'user',
  };
  const type = typeMap[ev.event_type] ?? 'system';
  const payload = (ev.payload ?? {}) as Record<string, unknown>;
  const title = (payload.title as string) ?? ev.event_type.replace(/_/g, ' ');
  const description = (payload.description as string) ?? (payload.reason as string);
  return {
    id: ev.id,
    type,
    title,
    description,
    actor: ev.actor_id ?? (payload.actor as string) ?? 'System',
    timestamp: ev.created_at,
    references: payload.references as string[] ?? (ev.entity_id ? [ev.entity_id] : []),
    metadata: payload as Record<string, string | number | undefined>,
  };
}

export function RecordDetail() {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchReilRecordDetail>>['detail']>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [attachDocId, setAttachDocId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [docNames, setDocNames] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW('Record');
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  useEffect(() => {
    if (!recordId) {
      setLoadState('notfound');
      return;
    }
    setLoadState('loading');
    fetchReilRecordDetail(recordId).then(({ detail: d, error }) => {
      if (error) {
        setDetail(null);
        setLoadState('error');
        return;
      }
      setDetail(d ?? null);
      setLoadState(d ? 'ready' : 'notfound');
    });
  }, [recordId]);

  const refetch = () => {
    if (!recordId) return;
    setLoadState('loading');
    fetchReilRecordDetail(recordId).then(({ detail: d, error }) => {
      if (error) {
        setDetail(null);
        setLoadState('error');
        return;
      }
      setDetail(d ?? null);
      setLoadState(d ? 'ready' : 'notfound');
    });
  };

  useEffect(() => {
    if (!detail?.links || !REIL_DEFAULT_ORG_ID || !supabase) return;
    const docIds = detail.links.filter((l) => l.source_type === 'document').map((l) => l.source_id);
    if (docIds.length === 0) return;
    const map: Record<string, string> = {};
    Promise.all(
      docIds.map(async (id) => {
        const res = await getDocumentById(supabase, REIL_DEFAULT_ORG_ID, id);
        if (!res.error && res.data) map[id] = res.data.name;
      })
    ).then(() => setDocNames((prev) => ({ ...prev, ...map })));
  }, [detail?.links, REIL_DEFAULT_ORG_ID]);

  const handleManualOverride = async () => {
    if (!recordId || !overrideReason.trim()) return;
    setActionLoading(true);
    const { ok, error } = await appendRecordLedgerEvent(
      recordId,
      'record.override',
      { reason: overrideReason.trim(), action: 'manual_override' }
    );
    setActionLoading(false);
    if (error) return;
    setOverrideModalOpen(false);
    setOverrideReason('');
    refetch();
  };

  const handleManualAttach = async () => {
    if (!recordId || !attachDocId.trim()) return;
    setActionLoading(true);
    const docId = attachDocId.trim();
    const { ok, error } = await attachDocumentToRecord(docId, recordId, 'manual');
    if (error) {
      setActionLoading(false);
      return;
    }
    await appendRecordLedgerEvent(recordId, 'document_attached', { document_id: docId, record_id: recordId, link_method: 'manual' });
    setActionLoading(false);
    setAttachModalOpen(false);
    setAttachDocId('');
    refetch();
  };

  if (loadState === 'loading' || loadState === 'notfound') {
    return (
      <div className="p-6">
        <ReilBreadcrumb items={[{ label: 'Records', path: '/reil/records' }, { label: 'Record' }]} className="mb-4" />
        <button
          onClick={() => navigate('/reil/records')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Records</span>
        </button>
        {loadState === 'loading' && (
          <div className="space-y-4">
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="60%" height={16} />
          </div>
        )}
        {loadState === 'notfound' && (
          <EmptyState
            icon={BriefcaseIcon}
            title="Record not found"
            description="This record may have been removed or the link is invalid."
            action={{ label: 'Back to Records', onClick: () => navigate('/reil/records') }}
          />
        )}
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="p-6">
        <ReilBreadcrumb items={[{ label: 'Records', path: '/reil/records' }, { label: 'Record' }]} className="mb-4" />
        <button
          onClick={() => navigate('/reil/records')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Records</span>
        </button>
        <ErrorState
          title="Failed to load record"
          description="We couldn't load this record. Check Supabase and VITE_REIL_ORG_ID."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!detail) return null;

  const { record, ledgerEvents, links } = detail;
  const timelineEvents = ledgerEvents.map(ledgerToTimelineEvent);
  const attachedDocs = links.filter((l) => l.source_type === 'document');
  const linkedContacts = links.filter((l) => l.source_type === 'contact');
  const RecordIcon = record.record_type === 'deal' ? BriefcaseIcon : HomeIcon;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <ReilBreadcrumb
        items={[{ label: 'Records', path: '/reil/records' }, { label: record.title }]}
        className="mb-4"
      />
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/reil/records')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Records</span>
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={DownloadIcon}
            onClick={() => {
              const csv = ledgerEventsByRecordToCsv(record.id, record.title, ledgerEvents);
              downloadCsv(csv, `reil-ledger-events-${record.id}-${new Date().toISOString().slice(0, 10)}.csv`);
            }}
          >
            Export ledger CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={DownloadIcon}
            onClick={() => {
              const json = ledgerEventsToJson(ledgerEvents);
              downloadJson(json, `reil-ledger-events-${record.id}-${new Date().toISOString().slice(0, 10)}.json`);
            }}
          >
            Export ledger JSON
          </Button>
          <Button variant="ghost" size="sm" leftIcon={RefreshCwIcon} onClick={refetch}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" leftIcon={PaperclipIcon} onClick={() => setAttachModalOpen(true)}>
            Manual attach
          </Button>
          <Button variant="secondary" size="sm" leftIcon={EditIcon} onClick={() => setOverrideModalOpen(true)}>
            Manual override
          </Button>
        </div>
      </div>

      {/* Record header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent-cyan-dim">
            <RecordIcon size={24} className="text-accent-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">{record.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color="neutral" size="sm">{record.record_type}</Badge>
              <Badge color="success" size="sm">{record.status}</Badge>
              {record.tags.length > 0 && record.tags.map((tag) => (
                <Badge key={tag} color="neutral" size="sm">{tag}</Badge>
              ))}
            </div>
            <p className="text-sm text-text-tertiary mt-2">
              Updated {new Date(record.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Main: Timeline */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Timeline (ledger events)</h2>
            {timelineEvents.length === 0 ? (
              <EmptyState
                icon={FileTextIcon}
                title="No events yet"
                description="Ledger events for this record will appear here."
              />
            ) : (
              <Timeline events={timelineEvents} groupByDay />
            )}
          </Card>
        </div>

        {/* Sidebar: Attached docs, linked contacts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Attached documents</h3>
            {attachedDocs.length === 0 ? (
              <p className="text-sm text-text-tertiary">No documents attached.</p>
            ) : (
              <ul className="space-y-2">
                {attachedDocs.map((link) => (
                  <li key={link.id} className="flex items-center gap-2 text-sm">
                    <FileTextIcon size={14} className="text-text-tertiary shrink-0" />
                    <span className="text-text-primary truncate min-w-0" title={link.source_id}>
                      {docNames[link.source_id] ?? link.source_id}
                    </span>
                    <Badge color="neutral" size="sm">{link.link_method}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Linked contacts</h3>
            {linkedContacts.length === 0 ? (
              <p className="text-sm text-text-tertiary">No contacts linked.</p>
            ) : (
              <ul className="space-y-2">
                {linkedContacts.map((link) => (
                  <li key={link.id} className="flex items-center gap-2 text-sm">
                    <UserIcon size={14} className="text-text-tertiary" />
                    <span className="text-text-primary truncate" title={link.source_id}>
                      {link.source_id}
                    </span>
                    <Badge color="neutral" size="sm">{link.link_method}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Manual override modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => !actionLoading && setOverrideModalOpen(false)}
        title="Manual override"
        description="Append a ledger event for this record (e.g. reason for override)."
      >
        <div className="space-y-4">
          <Input
            label="Reason / notes"
            placeholder="e.g. Manual status override after review"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOverrideModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleManualOverride} disabled={actionLoading || !overrideReason.trim()}>
              {actionLoading ? 'Saving…' : 'Append ledger event'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual attach modal */}
      <Modal
        isOpen={attachModalOpen}
        onClose={() => !actionLoading && setAttachModalOpen(false)}
        title="Attach document"
        description="Link a document to this record (document UUID)."
      >
        <div className="space-y-4">
          <Input
            label="Document ID"
            placeholder="UUID of the document to attach"
            value={attachDocId}
            onChange={(e) => setAttachDocId(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAttachModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleManualAttach} disabled={actionLoading || !attachDocId.trim()}>
              {actionLoading ? 'Linking…' : 'Attach'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
