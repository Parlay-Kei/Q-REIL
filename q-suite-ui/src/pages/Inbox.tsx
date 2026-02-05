import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { USE_INBOX_SEED_DATA, USE_REIL_CORE_INBOX } from '../constants/inbox';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  MailIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  LinkIcon,
  CheckIcon,
  RefreshCwIcon,
  TagIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { fetchThreads } from '../lib/inboxApi';
import { fetchReilInboxItems, type InboxFilters } from '../lib/reilInboxApi';
import type { ThreadRow } from '../types/inbox';
import type { InboxItemRow } from '../types/reil-core';
import { SEED_THREADS, seedThreadsAsReilItems } from '../data/seedInbox';

type ViewState = 'default' | 'loading' | 'empty' | 'error';

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
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [reilItems, setReilItems] = useState<InboxItemRow[]>([]);
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reilFilters, setReilFilters] = useState<InboxFilters>({});

  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW('Inbox');
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  useEffect(() => {
    if (USE_INBOX_SEED_DATA) {
      setThreads(SEED_THREADS);
      setViewState('default');
      return;
    }
    if (USE_REIL_CORE_INBOX) {
      setViewState('loading');
      fetchReilInboxItems(reilFilters).then(({ items, error }) => {
        if (error) {
          setReilItems([]);
          setViewState('error');
          return;
        }
        // Live mode: prefer DAL (Gmail) rows; if none, fall back to seed (ENGDEL-REIL-UI-LIVE-SWITCH-0027).
        const displayItems = items.length > 0 ? items : seedThreadsAsReilItems();
        setReilItems(displayItems);
        setViewState(displayItems.length === 0 ? 'empty' : 'default');
      });
      return;
    }
    setViewState('loading');
    fetchThreads().then(({ threads: list, error }) => {
      if (error) {
        setThreads([]);
        setViewState('error');
        return;
      }
      setThreads(list);
      setViewState(list.length === 0 ? 'empty' : 'default');
    });
  }, [USE_REIL_CORE_INBOX, reilFilters.sender, reilFilters.dateFrom, reilFilters.dateTo, reilFilters.type, reilFilters.reviewRequired]);

  const toggleThreadSelection = (threadId: string) => {
    setSelectedThreads((prev) =>
    prev.includes(threadId) ?
    prev.filter((id) => id !== threadId) :
    [...prev, threadId]
    );
  };
  const listLength = USE_REIL_CORE_INBOX ? reilItems.length : threads.length;
  const selectAll = () => {
    if (selectedThreads.length === listLength) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(USE_REIL_CORE_INBOX ? reilItems.map((i) => i.id) : threads.map((t) => t.id));
    }
  };
  const refetch = () => {
    if (USE_INBOX_SEED_DATA) return;
    if (USE_REIL_CORE_INBOX) {
      setViewState('loading');
      fetchReilInboxItems(reilFilters).then(({ items, error }) => {
        if (error) {
          setReilItems([]);
          setViewState('error');
          return;
        }
        // Live mode: prefer DAL (Gmail) rows; if none, fall back to seed (ENGDEL-REIL-UI-LIVE-SWITCH-0027).
        const displayItems = items.length > 0 ? items : seedThreadsAsReilItems();
        setReilItems(displayItems);
        setViewState(displayItems.length === 0 ? 'empty' : 'default');
      });
      return;
    }
    setViewState('loading');
    fetchThreads().then(({ threads: list, error }) => {
      if (error) {
        setThreads([]);
        setViewState('error');
        return;
      }
      setThreads(list);
      setViewState(list.length === 0 ? 'empty' : 'default');
    });
  };

  const renderStateDemo = () =>
    USE_INBOX_SEED_DATA ? (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-text-quaternary">Demo (seed):</span>
        {(['default', 'loading', 'empty', 'error'] as ViewState[]).map((state) => (
          <button
            key={state}
            onClick={() => setViewState(state)}
            className={`px-2 py-1 text-xs rounded ${viewState === state ? 'bg-accent-cyan-dim text-accent-cyan' : 'bg-surface-elevated text-text-tertiary'}`}
          >
            {state}
          </button>
        ))}
      </div>
    ) : null;

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
              {USE_REIL_CORE_INBOX && (
                <Input
                  label="Sender"
                  placeholder="Filter by sender..."
                  value={reilFilters.sender ?? ''}
                  onChange={(e) => setReilFilters((f) => ({ ...f, sender: e.target.value || undefined }))}
                />
              )}
              <Select
                label="Status"
                options={[
                  { value: 'all', label: USE_REIL_CORE_INBOX ? 'All items' : 'All threads' },
                  { value: 'unlinked', label: 'Unlinked only' },
                  { value: 'linked', label: 'Linked only' },
                ]}
                value="all"
                onChange={() => {}}
              />
              {USE_REIL_CORE_INBOX && (
                <Select
                  label="Review required"
                  options={[
                    { value: 'any', label: 'Any' },
                    { value: 'yes', label: 'Review required only' },
                  ]}
                  value={reilFilters.reviewRequired === true ? 'yes' : 'any'}
                  onChange={(v) => setReilFilters((f) => ({ ...f, reviewRequired: v === 'yes' }))}
                />
              )}
              <Select
                label="Type"
                options={[
                  { value: 'any', label: 'Any type' },
                  { value: 'gmail', label: 'Gmail' },
                  { value: 'message', label: 'Message' },
                ]}
                value={USE_REIL_CORE_INBOX ? (reilFilters.type ?? 'any') : 'any'}
                onChange={(v) => USE_REIL_CORE_INBOX && setReilFilters((f) => ({ ...f, type: (v === 'any' ? undefined : v) as string | undefined }))}
              />
              <Select
                label="Time Range"
                options={[
                  { value: 'all', label: 'All time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This week' },
                  { value: 'month', label: 'This month' },
                ]}
                value={
                  USE_REIL_CORE_INBOX
                    ? (reilFilters.dateFrom ? 'week' : 'all')
                    : 'all'
                }
                onChange={(v) => {
                  if (!USE_REIL_CORE_INBOX) return;
                  if (v === 'all') setReilFilters((f) => ({ ...f, dateFrom: undefined, dateTo: undefined }));
                  else {
                    const to = new Date().toISOString();
                    const from = new Date();
                    if (v === 'today') from.setHours(0, 0, 0, 0);
                    else if (v === 'week') from.setDate(from.getDate() - 7);
                    else if (v === 'month') from.setMonth(from.getMonth() - 1);
                    setReilFilters((f) => ({ ...f, dateFrom: from.toISOString(), dateTo: to }));
                  }
                }}
              />
            </div>

            <div className="mt-6 pt-4 border-t border-stroke-hairline">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => USE_REIL_CORE_INBOX && setReilFilters({})}
              >
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
            description="We couldn't load threads from the database. Check Supabase config and RLS/auth."
            onRetry={refetch} />

          }

          {viewState === 'default' &&
          <Card className="divide-y divide-stroke-hairline">
              {/* Select all header */}
              <div className="px-4 py-3 flex items-center gap-4 bg-surface-primary/40">
                <button
                  onClick={selectAll}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedThreads.length === listLength ? 'bg-accent-cyan border-accent-cyan' : selectedThreads.length > 0 ? 'bg-accent-cyan/50 border-accent-cyan' : 'border-stroke-subtle hover:border-stroke-medium'}`}
                >
                  {selectedThreads.length > 0 && <CheckIcon size={12} className="text-bg-deep" />}
                </button>
                <span className="text-sm text-text-tertiary">
                  {selectedThreads.length > 0 ? `${selectedThreads.length} of ${listLength} selected` : 'Select all'}
                </span>
              </div>

              {/* REIL Core: raw items with normalized status */}
              {USE_REIL_CORE_INBOX &&
                reilItems.map((item) => {
                  const isSelected = selectedThreads.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`px-4 py-4 flex items-start gap-4 transition-colors cursor-pointer ${isSelected ? 'bg-accent-cyan-dim/30' : 'hover:bg-surface-hover'}`}
                      onClick={() => navigate(`/reil/inbox/item/${item.id}`)}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleThreadSelection(item.id); }}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${isSelected ? 'bg-accent-cyan border-accent-cyan' : 'border-stroke-subtle hover:border-stroke-medium'}`}
                      >
                        {isSelected && <CheckIcon size={12} className="text-bg-deep" />}
                      </button>
                      <Avatar name={item.sender.split('<')[0].trim() || item.sender} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <span className="text-sm truncate text-text-secondary">{item.sender}</span>
                          <span className="text-xs text-text-quaternary whitespace-nowrap">{item.date}</span>
                        </div>
                        <h3 className="text-sm mb-1 truncate text-text-primary">{item.subject}</h3>
                        <p className="text-sm text-text-tertiary truncate mb-2">{item.preview}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {item.hasAttachments && (
                            <div className="flex items-center gap-1 text-text-quaternary">
                              <PaperclipIcon size={12} />
                              <span className="text-xs">{item.attachmentCount}</span>
                            </div>
                          )}
                          {item.normalized ? (
                            <Badge color="success" size="sm" dot>Normalized</Badge>
                          ) : (
                            <Badge color="warning" size="sm">Raw</Badge>
                          )}
                          {item.matchStatus != null && (
                            <Badge color="neutral" size="sm">Match: {item.matchStatus}</Badge>
                          )}
                          {item.itemConfidence != null && (
                            <span className="text-xs text-text-quaternary">Conf: {Math.round(item.itemConfidence * 100)}%</span>
                          )}
                          {item.reviewRequired && <Badge color="danger" size="sm">Review required</Badge>}
                          <Badge color="neutral" size="sm">{item.type}</Badge>
                        </div>
                      </div>
                      <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors">
                        <MoreHorizontalIcon size={16} />
                      </button>
                    </div>
                  );
                })}

              {/* Legacy: thread rows */}
              {!USE_REIL_CORE_INBOX &&
                threads.map((thread) => {
                  const isSelected = selectedThreads.includes(thread.id);
                  return (
                    <div
                      key={thread.id}
                      className={`px-4 py-4 flex items-start gap-4 transition-colors cursor-pointer ${isSelected ? 'bg-accent-cyan-dim/30' : 'hover:bg-surface-hover'}`}
                      onClick={() => navigate(`/reil/inbox/${thread.id}`)}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleThreadSelection(thread.id); }}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${isSelected ? 'bg-accent-cyan border-accent-cyan' : 'border-stroke-subtle hover:border-stroke-medium'}`}
                      >
                        {isSelected && <CheckIcon size={12} className="text-bg-deep" />}
                      </button>
                      <Avatar name={thread.from.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-sm truncate ${thread.isUnread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                              {thread.from.name}
                            </span>
                            {thread.isUnread && <span className="w-2 h-2 rounded-full bg-accent-cyan shrink-0" />}
                          </div>
                          <span className="text-xs text-text-quaternary whitespace-nowrap">{thread.timestamp}</span>
                        </div>
                        <h3 className={`text-sm mb-1 truncate ${thread.isUnread ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                          {thread.subject}
                        </h3>
                        <p className="text-sm text-text-tertiary truncate mb-2">{thread.preview}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {thread.hasAttachments && (
                            <div className="flex items-center gap-1 text-text-quaternary">
                              <PaperclipIcon size={12} />
                              <span className="text-xs">{thread.attachmentCount}</span>
                            </div>
                          )}
                          {thread.linkedRecord ? (
                            <Badge color="success" size="sm" dot>{thread.linkedRecord.type}: {thread.linkedRecord.name}</Badge>
                          ) : (
                            <Badge color="warning" size="sm">Unlinked</Badge>
                          )}
                          {thread.labels.map((label) => (
                            <Badge key={label} color={label === 'Urgent' ? 'danger' : label === 'Important' ? 'violet' : 'neutral'} size="sm">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors">
                        <MoreHorizontalIcon size={16} />
                      </button>
                    </div>
                  );
                })}
            </Card>
          }
        </div>
      </div>
    </div>);

}