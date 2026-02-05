import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_THREAD } from '../constants/brand';
import { USE_INBOX_SEED_DATA } from '../constants/inbox';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  ArrowLeftIcon,
  PaperclipIcon,
  LinkIcon,
  CheckIcon,
  MoreHorizontalIcon,
  ReplyIcon,
  ForwardIcon,
  ArchiveIcon,
  FileTextIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  UserIcon,
  BuildingIcon,
  BriefcaseIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { fetchThreadWithMessages } from '../lib/inboxApi';
import type { MessageRow } from '../types/inbox';
import { SEED_MESSAGES, SEED_THREAD_SUBJECT } from '../data/seedInbox';

const suggestedMatches = [
  { id: 'match-001', type: 'Deal', name: 'Meridian Capital Partners', confidence: 95, reason: 'Sender domain matches deal company', icon: BriefcaseIcon },
  { id: 'match-002', type: 'Contact', name: 'James Wilson', confidence: 92, reason: 'Email address matches existing contact', icon: UserIcon },
  { id: 'match-003', type: 'Company', name: 'Meridian Capital Partners', confidence: 88, reason: 'Company name mentioned in subject', icon: BuildingIcon },
];

const attachmentIcons: Record<string, typeof FileTextIcon> = {
  pdf: FileTextIcon,
  xlsx: FileSpreadsheetIcon,
  docx: FileTextIcon,
  png: ImageIcon,
  jpg: ImageIcon,
};

export function ThreadDetail() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  const [expandedMessages, setExpandedMessages] = useState<string[]>([]);
  const [linkedRecords, setLinkedRecords] = useState<string[]>([]);

  useEffect(() => {
    document.title = TITLE_REIL_THREAD;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  useEffect(() => {
    if (USE_INBOX_SEED_DATA) {
      setSubject(SEED_THREAD_SUBJECT);
      setMessages(SEED_MESSAGES);
      setExpandedMessages(SEED_MESSAGES[0] ? [SEED_MESSAGES[0].id] : []);
      setLoadState('ready');
      return;
    }
    if (!threadId) {
      setLoadState('notfound');
      return;
    }
    setLoadState('loading');
    fetchThreadWithMessages(threadId).then(({ subject: s, messages: msgs, error }) => {
      if (error) {
        setSubject('');
        setMessages([]);
        setLoadState('error');
        return;
      }
      setSubject(s);
      setMessages(msgs);
      setExpandedMessages(msgs[0] ? [msgs[0].id] : []);
      setLoadState('ready');
    });
  }, [threadId]);

  const toggleMessage = (messageId: string) => {
    setExpandedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };
  const linkRecord = (matchId: string) => {
    setLinkedRecords((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };
  const allAttachments = messages.flatMap((m) => m.attachments);
  if (loadState === 'loading' || loadState === 'notfound') {
    return (
      <div className="h-full flex flex-col p-6">
        <ReilBreadcrumb items={[{ label: 'Inbox', path: '/reil/inbox' }, { label: 'Thread' }]} className="mb-3" />
        <button
          onClick={() => navigate('/reil/inbox')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Inbox</span>
        </button>
        {loadState === 'loading' && (
          <p className="text-text-tertiary">Loading thread…</p>
        )}
        {loadState === 'notfound' && (
          <EmptyState
            icon={FileTextIcon}
            title="Thread not found"
            description="This thread may have been removed or the link is invalid."
            action={{ label: 'Back to Inbox', onClick: () => navigate('/reil/inbox') }}
          />
        )}
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="h-full flex flex-col p-6">
        <ReilBreadcrumb items={[{ label: 'Inbox', path: '/reil/inbox' }, { label: 'Thread' }]} className="mb-3" />
        <button
          onClick={() => navigate('/reil/inbox')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon size={18} />
          <span className="text-sm">Back to Inbox</span>
        </button>
        <ErrorState
          title="Failed to load thread"
          description="We couldn't load this thread from the database. Check Supabase config and RLS/auth."
          onRetry={() => threadId && fetchThreadWithMessages(threadId).then(({ subject: s, messages: msgs, error }) => {
            if (!error) {
              setSubject(s);
              setMessages(msgs);
              setExpandedMessages(msgs[0] ? [msgs[0].id] : []);
              setLoadState('ready');
            }
          })}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl shrink-0">
        <ReilBreadcrumb
          items={[{ label: 'Inbox', path: '/reil/inbox' }, { label: 'Thread' }]}
          className="mb-3"
        />
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/reil/inbox')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">

            <ArrowLeftIcon size={18} />
            <span className="text-sm">Back to Inbox</span>
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={ReplyIcon}>
              Reply
            </Button>
            <Button variant="ghost" size="sm" leftIcon={ForwardIcon}>
              Forward
            </Button>
            <Button variant="ghost" size="sm" leftIcon={ArchiveIcon}>
              Archive
            </Button>
            <Button variant="ghost" size="sm" leftIcon={MoreHorizontalIcon}>⋯</Button>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-text-primary mb-2">
          {subject || '(No subject)'}
        </h1>

        <div className="flex items-center gap-3">
          <Badge color="warning">Unlinked</Badge>
          <div className="flex items-center gap-1 text-text-tertiary">
            <PaperclipIcon size={14} />
            <span className="text-sm">{allAttachments.length} attachments</span>
          </div>
          <span className="text-sm text-text-quaternary">{messages.length} messages</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Message Stack */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl space-y-4">
            {messages.map((message, index) => {
              const isExpanded = expandedMessages.includes(message.id);
              const isLatest = index === 0;
              return (
                <Card key={message.id} className="overflow-hidden">
                  {/* Message header */}
                  <button
                    onClick={() => toggleMessage(message.id)}
                    className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-surface-hover/50 transition-colors">

                    <Avatar name={message.from.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-medium text-text-primary">
                            {message.from.name}
                          </span>
                          <span className="text-text-tertiary ml-2 text-sm">
                            &lt;{message.from.email}&gt;
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-quaternary">
                            {message.timestamp}
                          </span>
                          {isExpanded ?
                          <ChevronUpIcon
                            size={16}
                            className="text-text-tertiary" /> :


                          <ChevronDownIcon
                            size={16}
                            className="text-text-tertiary" />

                          }
                        </div>
                      </div>
                      {!isExpanded &&
                      <p className="text-sm text-text-tertiary truncate mt-1">
                          {message.content.split('\n')[0]}
                        </p>
                      }
                    </div>
                  </button>

                  {/* Message content */}
                  {isExpanded &&
                  <div className="px-5 pb-5 animate-slide-down">
                      <div className="pl-14">
                        <div className="text-sm text-text-tertiary mb-4">
                          To: {message.to.map((t) => t.name).join(', ')}
                        </div>

                        <div className="prose prose-invert prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-text-primary bg-transparent p-0 m-0">
                            {message.content}
                          </pre>
                        </div>

                        {/* Attachments */}
                        {message.attachments.length > 0 &&
                      <div className="mt-6 pt-4 border-t border-stroke-hairline">
                            <p className="text-sm font-medium text-text-secondary mb-3">
                              Attachments ({message.attachments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.attachments.map((attachment, i) => {
                            const Icon =
                            attachmentIcons[attachment.type] ||
                            FileTextIcon;
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover transition-colors cursor-pointer">

                                    <Icon
                                  size={16}
                                  className="text-text-tertiary" />

                                    <span className="text-sm text-text-primary">
                                      {attachment.name}
                                    </span>
                                    <span className="text-xs text-text-quaternary">
                                      {attachment.size}
                                    </span>
                                  </div>);

                          })}
                            </div>
                          </div>
                      }
                      </div>
                    </div>
                  }
                </Card>);

            })}
          </div>
        </div>

        {/* Linking Panel */}
        <div className="w-80 border-l border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl overflow-y-auto shrink-0">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon size={18} className="text-accent-cyan" />
              <h3 className="font-semibold text-text-primary">
                Suggested Links
              </h3>
            </div>

            <p className="text-sm text-text-tertiary mb-4">
              AI-detected records that may be related to this thread.
            </p>

            <div className="space-y-3">
              {suggestedMatches.map((match) => {
                const Icon = match.icon;
                const isLinked = linkedRecords.includes(match.id);
                return (
                  <div
                    key={match.id}
                    className={`p-4 rounded-xl border transition-all ${isLinked ? 'bg-success-dim border-success/30' : 'bg-surface-elevated border-stroke-hairline hover:border-stroke-subtle'}`}>

                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${isLinked ? 'bg-success/20' : 'bg-surface-hover'}`}>

                        <Icon
                          size={16}
                          className={
                          isLinked ? 'text-success' : 'text-text-tertiary'
                          } />

                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs text-text-tertiary">
                            {match.type}
                          </span>
                          <Badge
                            color={
                            match.confidence >= 90 ?
                            'success' :
                            match.confidence >= 80 ?
                            'warning' :
                            'neutral'
                            }
                            size="sm">

                            {match.confidence}%
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">
                          {match.name}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          {match.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => linkRecord(match.id)}
                      className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLinked ? 'bg-success/20 text-success' : 'bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20'}`}>

                      {isLinked ?
                      <>
                          <CheckIcon size={14} />
                          Linked
                        </> :

                      <>
                          <LinkIcon size={14} />
                          Link to record
                        </>
                      }
                    </button>
                  </div>);

              })}
            </div>

            {/* Manual link */}
            <div className="mt-6 pt-4 border-t border-stroke-hairline">
              <Button
                variant="secondary"
                className="w-full"
                leftIcon={LinkIcon}>

                Link to other record
              </Button>
            </div>

            {/* Audit info */}
            <div className="mt-6 pt-4 border-t border-stroke-hairline">
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                Audit Trail
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Thread ID</span>
                  <span className="font-mono text-text-quaternary">
                    THR-2024-1204
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Ingested</span>
                  <span className="font-mono text-text-quaternary">
                    Jan 30, 10:42 AM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Source</span>
                  <span className="text-text-quaternary">Gmail</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Status</span>
                  <Badge color="warning" size="sm">
                    Unlinked
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}