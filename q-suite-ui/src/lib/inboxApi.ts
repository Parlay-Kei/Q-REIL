import { supabase } from './supabase';
import type { ThreadRow, MessageRow, MailThreadRow, MailMessageRow, RecordLinkRow } from '../types/inbox';

function formatTimestamp(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function threadRowFromDb(t: MailThreadRow, link: RecordLinkRow | null): ThreadRow {
  const emails = t.participant_emails ?? [];
  const fromEmail = emails[0] ?? 'unknown@unknown.com';
  return {
    id: t.id,
    subject: t.subject ?? '(No subject)',
    from: { name: fromEmail.split('@')[0] ?? 'Unknown', email: fromEmail },
    preview: t.snippet ?? '',
    timestamp: formatTimestamp(t.last_message_at),
    isUnread: !t.is_read,
    hasAttachments: t.has_attachments ?? false,
    attachmentCount: t.has_attachments ? (t.message_count || 0) : 0,
    linkedRecord: link
      ? { type: link.target_type.charAt(0).toUpperCase() + link.target_type.slice(1), name: link.target_id }
      : null,
    labels: t.label_ids ?? [],
  };
}

export async function fetchThreads(): Promise<{ threads: ThreadRow[]; error: Error | null }> {
  if (!supabase) {
    return { threads: [], error: new Error('Supabase client not configured') };
  }
  const { data: rows, error: e } = await supabase
    .from('mail_threads')
    .select('id, subject, snippet, participant_emails, message_count, has_attachments, last_message_at, is_read, label_ids')
    .order('last_message_at', { ascending: false })
    .limit(100);
  if (e) {
    return { threads: [], error: e as unknown as Error };
  }
  const list = (rows ?? []) as MailThreadRow[];
  const threadIds = list.map((t) => t.id);
  const linksByThread: Record<string, RecordLinkRow> = {};
  if (threadIds.length > 0) {
    const { data: linkRows } = await supabase
      .from('record_links')
      .select('source_type, source_id, target_type, target_id')
      .eq('source_type', 'thread')
      .in('source_id', threadIds);
    const links = (linkRows ?? []) as RecordLinkRow[];
    links.forEach((l) => {
      linksByThread[l.source_id] = l;
    });
  }
  const threads = list.map((t) => threadRowFromDb(t, linksByThread[t.id] ?? null));
  return { threads, error: null };
}

function messageRowFromDb(m: MailMessageRow): MessageRow {
  const toEmails = m.to_emails ?? [];
  return {
    id: m.id,
    from: {
      name: m.from_name ?? m.from_email.split('@')[0] ?? 'Unknown',
      email: m.from_email,
    },
    to: toEmails.map((e) => ({ name: e.split('@')[0] ?? 'Unknown', email: e })),
    timestamp: m.sent_at ? new Date(m.sent_at).toLocaleString() : '',
    content: m.body_plain ?? '',
    attachments: [], // mail_attachments would need a separate query; keep empty for now
  };
}

export async function fetchThreadWithMessages(
  threadId: string
): Promise<{ subject: string; messages: MessageRow[]; error: Error | null }> {
  if (!supabase) {
    return { subject: '', messages: [], error: new Error('Supabase client not configured') };
  }
  const { data: thread, error: te } = await supabase
    .from('mail_threads')
    .select('id, subject')
    .eq('id', threadId)
    .single();
  if (te || !thread) {
    return {
      subject: '',
      messages: [],
      error: (te as unknown as Error) ?? new Error('Thread not found'),
    };
  }
  const { data: msgRows, error: me } = await supabase
    .from('mail_messages')
    .select('id, from_email, from_name, to_emails, subject, body_plain, sent_at, has_attachments')
    .eq('thread_id', threadId)
    .order('sent_at', { ascending: true });
  if (me) {
    return {
      subject: (thread as { subject?: string }).subject ?? '',
      messages: [],
      error: me as unknown as Error,
    };
  }
  const messages = ((msgRows ?? []) as MailMessageRow[]).map(messageRowFromDb);
  return {
    subject: (thread as { subject?: string }).subject ?? '(No subject)',
    messages,
    error: null,
  };
}
