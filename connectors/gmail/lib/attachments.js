/**
 * Download Gmail attachments; store in Supabase Storage or reference only when >25MB.
 */
import crypto from 'crypto';

const BUCKET = 'mail-attachments';
const REFERENCE_ONLY_SIZE_BYTES = 25 * 1024 * 1024;

export async function downloadAndStore(supabase, gmail, opts) {
  const { messageId, attachmentId, filename, mimeType, sizeBytes, dbMessageId, mailboxId, orgId } = opts;
  const referenceOnly = sizeBytes > REFERENCE_ONLY_SIZE_BYTES;
  let storagePath = null;
  let sha256 = null;

  if (!referenceOnly) {
    const res = await gmail.users.messages.attachments.get({ userId: 'me', messageId, id: attachmentId });
    const data = res.data.data;
    if (!data) throw new Error(`No attachment data for ${messageId}/${attachmentId}`);
    const buffer = Buffer.from(data, 'base64url');
    sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    storagePath = `${orgId}/${mailboxId}/${sha256}/${filename}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, { contentType: mimeType || 'application/octet-stream', upsert: true });
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
  } else {
    storagePath = `gmail:ref:${messageId}:${attachmentId}`;
  }

  const { data: attachment, error } = await supabase.from('mail_attachments').upsert({
    org_id: orgId,
    mailbox_id: mailboxId,
    message_id: dbMessageId,
    provider_attachment_id: attachmentId,
    filename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    storage_path: storagePath,
    sha256,
  }, { onConflict: 'message_id,provider_attachment_id' }).select('id').single();

  if (error) throw new Error(`mail_attachments upsert failed: ${error.message}`);
  return { id: attachment.id, stored: !referenceOnly, storage_path: storagePath, storage_bucket: BUCKET, sha256 };
}
