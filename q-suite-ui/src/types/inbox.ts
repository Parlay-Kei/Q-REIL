/** UI shape for a thread row (Inbox list). */
export type ThreadRow = {
  id: string;
  subject: string;
  from: { name: string; email: string };
  preview: string;
  timestamp: string;
  isUnread: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  linkedRecord: { type: string; name: string } | null;
  labels: string[];
};

/** UI shape for a message in ThreadDetail. */
export type MessageRow = {
  id: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  timestamp: string;
  content: string;
  attachments: { name: string; type: string; size: string }[];
};

/** DB row: mail_threads (subset). */
export type MailThreadRow = {
  id: string;
  subject: string | null;
  snippet: string | null;
  participant_emails: string[] | null;
  message_count: number;
  has_attachments: boolean;
  last_message_at: string | null;
  is_read: boolean;
  label_ids: string[] | null;
};

/** DB row: mail_messages (subset). */
export type MailMessageRow = {
  id: string;
  from_email: string;
  from_name: string | null;
  to_emails: string[] | null;
  subject: string | null;
  body_plain: string | null;
  sent_at: string | null;
  has_attachments: boolean;
};

/** DB row: record_links (for thread). */
export type RecordLinkRow = {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
};
