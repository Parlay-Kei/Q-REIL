import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_THREAD } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  ArrowLeftIcon,
  PaperclipIcon,
  LinkIcon,
  MoreHorizontalIcon,
  ReplyIcon,
  ForwardIcon,
  ArchiveIcon,
  TagIcon,
  CheckIcon,
  XIcon,
  FileTextIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  UserIcon,
  BuildingIcon,
  BriefcaseIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
const messages = [
{
  id: 'msg-001',
  from: {
    name: 'James Wilson',
    email: 'james@meridiancp.com'
  },
  to: [
  {
    name: 'Alex Morgan',
    email: 'alex@stratanoble.com'
  }],

  timestamp: 'Today at 10:42 AM',
  content: `Hi Alex,

Following up on our discussion about the investment terms. I have reviewed the latest draft and have a few comments that I'd like to discuss.

The key points are:
1. The valuation methodology needs clarification in Section 3.2
2. We'd like to propose an adjustment to the liquidation preferences
3. The timeline for the due diligence process seems aggressive

Could we schedule a call this week to go through these items? I'm available Thursday or Friday afternoon.

Best regards,
James`,
  attachments: [
  {
    name: 'Investment_Terms_v3.pdf',
    type: 'pdf',
    size: '2.4 MB'
  },
  {
    name: 'Financial_Model.xlsx',
    type: 'xlsx',
    size: '1.8 MB'
  }]

},
{
  id: 'msg-002',
  from: {
    name: 'Alex Morgan',
    email: 'alex@stratanoble.com'
  },
  to: [
  {
    name: 'James Wilson',
    email: 'james@meridiancp.com'
  }],

  timestamp: 'Yesterday at 4:15 PM',
  content: `James,

Thank you for the detailed feedback. I've noted all your points and will prepare responses for our call.

Thursday at 2 PM works well for me. I'll send a calendar invite shortly.

In the meantime, I'm attaching the updated due diligence checklist that addresses some of your timeline concerns.

Best,
Alex`,
  attachments: [
  {
    name: 'DD_Checklist_Updated.pdf',
    type: 'pdf',
    size: '890 KB'
  }]

},
{
  id: 'msg-003',
  from: {
    name: 'James Wilson',
    email: 'james@meridiancp.com'
  },
  to: [
  {
    name: 'Alex Morgan',
    email: 'alex@stratanoble.com'
  }],

  timestamp: 'Yesterday at 2:30 PM',
  content: `Alex,

I wanted to share the initial investment proposal for your review. This outlines our terms and expectations for the partnership.

Please let me know if you have any questions or concerns.

Best,
James`,
  attachments: []
}];

const suggestedMatches = [
{
  id: 'match-001',
  type: 'Deal',
  name: 'Meridian Capital Partners',
  confidence: 95,
  reason: 'Sender domain matches deal company',
  icon: BriefcaseIcon
},
{
  id: 'match-002',
  type: 'Contact',
  name: 'James Wilson',
  confidence: 92,
  reason: 'Email address matches existing contact',
  icon: UserIcon
},
{
  id: 'match-003',
  type: 'Company',
  name: 'Meridian Capital Partners',
  confidence: 88,
  reason: 'Company name mentioned in subject',
  icon: BuildingIcon
}];

const attachmentIcons: Record<string, typeof FileTextIcon> = {
  pdf: FileTextIcon,
  xlsx: FileSpreadsheetIcon,
  docx: FileTextIcon,
  png: ImageIcon,
  jpg: ImageIcon
};
export function ThreadDetail() {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [expandedMessages, setExpandedMessages] = useState<string[]>([
  messages[0].id]
  );
  const [linkedRecords, setLinkedRecords] = useState<string[]>([]);
  const toggleMessage = (messageId: string) => {
    setExpandedMessages((prev) =>
    prev.includes(messageId) ?
    prev.filter((id) => id !== messageId) :
    [...prev, messageId]
    );
  };
  const linkRecord = (matchId: string) => {
    setLinkedRecords((prev) =>
    prev.includes(matchId) ?
    prev.filter((id) => id !== matchId) :
    [...prev, matchId]
    );
  };
  const allAttachments = messages.flatMap((m) => m.attachments);
  useEffect(() => {
    document.title = TITLE_REIL_THREAD;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
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
          RE: Q3 Investment Proposal - Final Review
        </h1>

        <div className="flex items-center gap-3">
          <Badge color="warning">Unlinked</Badge>
          <div className="flex items-center gap-1 text-text-tertiary">
            <PaperclipIcon size={14} />
            <span className="text-sm">{allAttachments.length} attachments</span>
          </div>
          <span className="text-sm text-text-quaternary">3 messages</span>
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