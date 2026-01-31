import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  MailIcon,
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  LinkIcon,
  CheckIcon,
  ChevronDownIcon,
  RefreshCwIcon,
  ArchiveIcon,
  TagIcon,
  XIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';

type ViewState = 'default' | 'loading' | 'empty' | 'error';
const threads = [
{
  id: 'thr-001',
  subject: 'RE: Q3 Investment Proposal - Final Review',
  from: {
    name: 'James Wilson',
    email: 'james@meridiancp.com'
  },
  preview:
  'Following up on our discussion about the investment terms. I have reviewed the latest draft and have a few comments...',
  timestamp: '10:42 AM',
  isUnread: true,
  hasAttachments: true,
  attachmentCount: 3,
  linkedRecord: null,
  labels: ['Important']
},
{
  id: 'thr-002',
  subject: 'Due Diligence Documents - Apex Holdings',
  from: {
    name: 'Sarah Chen',
    email: 'sarah@apexholdings.com'
  },
  preview:
  'Please find attached the requested financial statements and audit reports for your review...',
  timestamp: '9:15 AM',
  isUnread: true,
  hasAttachments: true,
  attachmentCount: 5,
  linkedRecord: {
    type: 'Deal',
    name: 'Apex Holdings'
  },
  labels: []
},
{
  id: 'thr-003',
  subject: 'Contract Review - Urgent Action Required',
  from: {
    name: 'Michael Torres',
    email: 'mtorres@pinnacle.io'
  },
  preview:
  'Our legal team has reviewed the contract and has some concerns regarding the liability clauses...',
  timestamp: 'Yesterday',
  isUnread: false,
  hasAttachments: true,
  attachmentCount: 1,
  linkedRecord: {
    type: 'Deal',
    name: 'Pinnacle Investments'
  },
  labels: ['Urgent']
},
{
  id: 'thr-004',
  subject: 'Partnership Opportunity Discussion',
  from: {
    name: 'Emily Park',
    email: 'emily@horizongroup.com'
  },
  preview:
  'I wanted to reach out regarding a potential partnership opportunity that I believe could be mutually beneficial...',
  timestamp: 'Yesterday',
  isUnread: false,
  hasAttachments: false,
  attachmentCount: 0,
  linkedRecord: null,
  labels: []
},
{
  id: 'thr-005',
  subject: 'Meeting Follow-up: Sterling Partners',
  from: {
    name: 'David Kim',
    email: 'dkim@sterling.com'
  },
  preview:
  'Thank you for taking the time to meet with us yesterday. As discussed, I am attaching the proposal...',
  timestamp: '2 days ago',
  isUnread: false,
  hasAttachments: true,
  attachmentCount: 2,
  linkedRecord: {
    type: 'Contact',
    name: 'David Kim'
  },
  labels: []
},
{
  id: 'thr-006',
  subject: 'RE: Budget Approval Request',
  from: {
    name: 'Lisa Anderson',
    email: 'lisa@venturecap.com'
  },
  preview:
  'The budget has been approved by the board. Please proceed with the next steps as outlined...',
  timestamp: '3 days ago',
  isUnread: false,
  hasAttachments: false,
  attachmentCount: 0,
  linkedRecord: {
    type: 'Deal',
    name: 'Venture Capital Fund'
  },
  labels: []
}];

const filterTabs = [
{
  id: 'all',
  label: 'All',
  count: 47
},
{
  id: 'unlinked',
  label: 'Unlinked',
  count: 12
},
{
  id: 'attachments',
  label: 'Has Attachments',
  count: 28
},
{
  id: 'unread',
  label: 'Unread',
  count: 5
}];

export function Inbox() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('default');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW('Inbox');
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  const toggleThreadSelection = (threadId: string) => {
    setSelectedThreads((prev) =>
    prev.includes(threadId) ?
    prev.filter((id) => id !== threadId) :
    [...prev, threadId]
    );
  };
  const selectAll = () => {
    if (selectedThreads.length === threads.length) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(threads.map((t) => t.id));
    }
  };
  // Demo state switcher
  const renderStateDemo = () =>
  <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-text-quaternary">Demo:</span>
      {(['default', 'loading', 'empty', 'error'] as ViewState[]).map(
      (state) =>
      <button
        key={state}
        onClick={() => setViewState(state)}
        className={`px-2 py-1 text-xs rounded ${viewState === state ? 'bg-accent-cyan-dim text-accent-cyan' : 'bg-surface-elevated text-text-tertiary'}`}>

            {state}
          </button>

    )}
    </div>;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <ReilBreadcrumb items={[{ label: 'Inbox' }]} className="mb-4" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
            Inbox
          </h1>
          <p className="text-text-secondary">
            Manage email threads and link evidence to records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={RefreshCwIcon}>
            Sync
          </Button>
          <Button variant="primary" leftIcon={LinkIcon}>
            Link selected
          </Button>
        </div>
      </div>

      {renderStateDemo()}

      <div className="grid grid-cols-12 gap-6">
        {/* Filters Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Filters
            </h3>

            <div className="space-y-4">
              <Select
                label="Status"
                options={[
                {
                  value: 'all',
                  label: 'All threads'
                },
                {
                  value: 'unlinked',
                  label: 'Unlinked only'
                },
                {
                  value: 'linked',
                  label: 'Linked only'
                }]
                }
                value="all"
                onChange={() => {}} />


              <Select
                label="Has Attachments"
                options={[
                {
                  value: 'any',
                  label: 'Any'
                },
                {
                  value: 'yes',
                  label: 'With attachments'
                },
                {
                  value: 'no',
                  label: 'No attachments'
                }]
                }
                value="any"
                onChange={() => {}} />


              <Select
                label="Linked Type"
                options={[
                {
                  value: 'any',
                  label: 'Any type'
                },
                {
                  value: 'deal',
                  label: 'Deals'
                },
                {
                  value: 'contact',
                  label: 'Contacts'
                },
                {
                  value: 'company',
                  label: 'Companies'
                }]
                }
                value="any"
                onChange={() => {}} />


              <Select
                label="Time Range"
                options={[
                {
                  value: 'all',
                  label: 'All time'
                },
                {
                  value: 'today',
                  label: 'Today'
                },
                {
                  value: 'week',
                  label: 'This week'
                },
                {
                  value: 'month',
                  label: 'This month'
                }]
                }
                value="all"
                onChange={() => {}} />

            </div>

            <div className="mt-6 pt-4 border-t border-stroke-hairline">
              <Button variant="ghost" size="sm" className="w-full">
                Clear all filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Thread List */}
        <div className="col-span-12 lg:col-span-9">
          {/* Search and tabs */}
          <div className="mb-4 space-y-4">
            <Input
              variant="search"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />


            <div className="flex items-center justify-between">
              <Tabs
                tabs={filterTabs}
                activeTab={activeFilter}
                onChange={setActiveFilter}
                variant="pills"
                size="sm" />


              {selectedThreads.length > 0 &&
              <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-sm text-text-tertiary">
                    {selectedThreads.length} selected
                  </span>
                  <Button variant="ghost" size="sm" leftIcon={LinkIcon}>
                    Link to record
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={CheckIcon}>
                    Mark reviewed
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={TagIcon}>
                    Add note
                  </Button>
                </div>
              }
            </div>
          </div>

          {/* Content based on state */}
          {viewState === 'loading' &&
          <div className="space-y-3">
              {Array.from({
              length: 5
            }).map((_, i) =>
            <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton variant="text" width="60%" className="mb-2" />
                      <Skeleton
                    variant="text"
                    width="40%"
                    height={14}
                    className="mb-2" />

                      <Skeleton variant="text" width="90%" height={14} />
                    </div>
                  </div>
                </Card>
            )}
            </div>
          }

          {viewState === 'empty' &&
          <EmptyState
            icon={MailIcon}
            title="No threads found"
            description="There are no email threads matching your current filters. Try adjusting your search or filters."
            action={{
              label: 'Clear filters',
              onClick: () => {}
            }} />

          }

          {viewState === 'error' &&
          <ErrorState
            title="Failed to load inbox"
            description="We couldn't connect to your email provider. Please check your connection and try again."
            onRetry={() => setViewState('default')} />

          }

          {viewState === 'default' &&
          <Card className="divide-y divide-stroke-hairline">
              {/* Select all header */}
              <div className="px-4 py-3 flex items-center gap-4 bg-surface-primary/40">
                <button
                onClick={selectAll}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedThreads.length === threads.length ? 'bg-accent-cyan border-accent-cyan' : selectedThreads.length > 0 ? 'bg-accent-cyan/50 border-accent-cyan' : 'border-stroke-subtle hover:border-stroke-medium'}`}>

                  {selectedThreads.length > 0 &&
                <CheckIcon size={12} className="text-bg-deep" />
                }
                </button>
                <span className="text-sm text-text-tertiary">
                  {selectedThreads.length > 0 ?
                `${selectedThreads.length} of ${threads.length} selected` :
                'Select all'}
                </span>
              </div>

              {/* Thread rows */}
              {threads.map((thread) => {
              const isSelected = selectedThreads.includes(thread.id);
              return (
                <div
                  key={thread.id}
                  className={`px-4 py-4 flex items-start gap-4 transition-colors cursor-pointer ${isSelected ? 'bg-accent-cyan-dim/30' : 'hover:bg-surface-hover'}`}
                  onClick={() => navigate(`/reil/inbox/${thread.id}`)}>

                    {/* Checkbox */}
                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleThreadSelection(thread.id);
                    }}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${isSelected ? 'bg-accent-cyan border-accent-cyan' : 'border-stroke-subtle hover:border-stroke-medium'}`}>

                      {isSelected &&
                    <CheckIcon size={12} className="text-bg-deep" />
                    }
                    </button>

                    {/* Avatar */}
                    <Avatar name={thread.from.name} size="sm" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                          className={`text-sm truncate ${thread.isUnread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>

                            {thread.from.name}
                          </span>
                          {thread.isUnread &&
                        <span className="w-2 h-2 rounded-full bg-accent-cyan shrink-0" />
                        }
                        </div>
                        <span className="text-xs text-text-quaternary whitespace-nowrap">
                          {thread.timestamp}
                        </span>
                      </div>

                      <h3
                      className={`text-sm mb-1 truncate ${thread.isUnread ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>

                        {thread.subject}
                      </h3>

                      <p className="text-sm text-text-tertiary truncate mb-2">
                        {thread.preview}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {thread.hasAttachments &&
                      <div className="flex items-center gap-1 text-text-quaternary">
                            <PaperclipIcon size={12} />
                            <span className="text-xs">
                              {thread.attachmentCount}
                            </span>
                          </div>
                      }

                        {thread.linkedRecord ?
                      <Badge color="success" size="sm" dot>
                            {thread.linkedRecord.type}:{' '}
                            {thread.linkedRecord.name}
                          </Badge> :

                      <Badge color="warning" size="sm">
                            Unlinked
                          </Badge>
                      }

                        {thread.labels.map((label) =>
                      <Badge
                        key={label}
                        color={
                        label === 'Urgent' ?
                        'danger' :
                        label === 'Important' ?
                        'violet' :
                        'neutral'
                        }
                        size="sm">

                            {label}
                          </Badge>
                      )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors">

                      <MoreHorizontalIcon size={16} />
                    </button>
                  </div>);

            })}
            </Card>
          }
        </div>
      </div>
    </div>);

}