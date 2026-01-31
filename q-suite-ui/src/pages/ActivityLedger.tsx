import React, { useState, useEffect, createElement } from 'react';
import {
  ClockIcon,
  SearchIcon,
  FilterIcon,
  ListIcon,
  CalendarIcon,
  DownloadIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  FileTextIcon,
  MailIcon,
  LinkIcon,
  UserIcon,
  BriefcaseIcon,
  SettingsIcon,
  XIcon } from
'lucide-react';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Table } from '../components/ui/Table';
import { Timeline } from '../components/ui/Timeline';
import { Drawer } from '../components/ui/Drawer';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Skeleton, SkeletonTimeline } from '../components/ui/Skeleton';
type ViewState = 'default' | 'loading' | 'empty' | 'error';
type ViewMode = 'table' | 'timeline';
const ledgerEvents = [
{
  id: 'EVT-2024-0892',
  type: 'document' as const,
  title: 'Document linked to Deal',
  description:
  'Q3 Financial Report attached to Meridian Capital Partners deal',
  actor: 'Sarah Chen',
  timestamp: new Date().toISOString(),
  references: ['DOC-2024-0892', 'DEAL-0156'],
  metadata: {
    documentName: 'Q3 Financial Report.pdf',
    dealName: 'Meridian Capital Partners',
    action: 'link'
  }
},
{
  id: 'EVT-2024-0891',
  type: 'email' as const,
  title: 'Thread attached to Contact',
  description:
  'Email thread from James Wilson linked to Apex Holdings contact',
  actor: 'System',
  timestamp: new Date(Date.now() - 1800000).toISOString(),
  references: ['THR-2024-1204', 'CON-0234'],
  metadata: {
    threadSubject: 'RE: Q3 Investment Proposal',
    contactName: 'James Wilson',
    action: 'auto-link'
  }
},
{
  id: 'EVT-2024-0890',
  type: 'deal' as const,
  title: 'Deal stage updated',
  description: 'Pinnacle Investments moved from Qualification to Proposal',
  actor: 'Michael Torres',
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  references: ['DEAL-0142'],
  metadata: {
    dealName: 'Pinnacle Investments',
    fromStage: 'Qualification',
    toStage: 'Proposal'
  }
},
{
  id: 'EVT-2024-0889',
  type: 'link' as const,
  title: 'Evidence linked',
  description: 'Contract draft linked to Horizon Group deal workspace',
  actor: 'Emily Park',
  timestamp: new Date(Date.now() - 7200000).toISOString(),
  references: ['DOC-2024-0891', 'DEAL-0148'],
  metadata: {
    documentName: 'Contract_Draft_v2.docx',
    dealName: 'Horizon Group'
  }
},
{
  id: 'EVT-2024-0888',
  type: 'user' as const,
  title: 'Contact created',
  description: 'New contact added: David Kim, CFO at Sterling Partners',
  actor: 'Alex Morgan',
  timestamp: new Date(Date.now() - 10800000).toISOString(),
  references: ['CON-2024-0567'],
  metadata: {
    contactName: 'David Kim',
    company: 'Sterling Partners',
    role: 'CFO'
  }
},
{
  id: 'EVT-2024-0887',
  type: 'system' as const,
  title: 'Connector sync completed',
  description: 'Gmail connector synced 24 new threads',
  actor: 'System',
  timestamp: new Date(Date.now() - 14400000).toISOString(),
  references: [],
  metadata: {
    connector: 'Gmail',
    threadsSync: 24,
    documentsSync: 12
  }
}];

const eventTypeIcons = {
  document: FileTextIcon,
  email: MailIcon,
  link: LinkIcon,
  user: UserIcon,
  deal: BriefcaseIcon,
  system: SettingsIcon
};
const eventTypeColors = {
  document: 'violet',
  email: 'cyan',
  link: 'teal',
  user: 'success',
  deal: 'warning',
  system: 'neutral'
};
export function ActivityLedger() {
  const [viewState, setViewState] = useState<ViewState>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof ledgerEvents)[0] | null>(
    null);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW('Ledger');
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  const columns = [
  {
    key: 'id',
    header: 'Event ID',
    width: '15%',
    render: (value: string) =>
    <span className="font-mono text-sm text-accent-cyan">{value}</span>

  },
  {
    key: 'type',
    header: 'Type',
    width: '10%',
    render: (value: keyof typeof eventTypeIcons) => {
      const Icon = eventTypeIcons[value];
      const color = eventTypeColors[value] as
      'cyan' |
      'violet' |
      'teal' |
      'success' |
      'warning' |
      'neutral';
      return (
        <Badge color={color} size="sm">
            <Icon size={12} className="mr-1" />
            {value}
          </Badge>);

    }
  },
  {
    key: 'title',
    header: 'Event',
    width: '30%',
    render: (value: string, row: (typeof ledgerEvents)[0]) =>
    <div>
          <p className="text-text-primary font-medium">{row.title}</p>
          <p className="text-xs text-text-tertiary truncate">
            {row.description}
          </p>
        </div>

  },
  {
    key: 'actor',
    header: 'Actor',
    width: '15%',
    render: (value: string) =>
    <span className="text-text-secondary text-sm">{value}</span>

  },
  {
    key: 'timestamp',
    header: 'Timestamp',
    width: '15%',
    render: (value: string) =>
    <span className="font-mono text-sm text-text-tertiary">
          {new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}
        </span>

  },
  {
    key: 'references',
    header: 'References',
    width: '15%',
    render: (value: string[]) =>
    <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((ref, i) =>
      <span
        key={i}
        className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary">

              {ref}
            </span>
      )}
          {value.length > 2 &&
      <span className="text-xs text-text-quaternary">
              +{value.length - 2}
            </span>
      }
        </div>

  }];

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
      <ReilBreadcrumb items={[{ label: 'Ledger' }]} className="mb-4" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
            Activity Ledger
          </h1>
          <p className="text-text-secondary">
            Immutable record of all system events, transactions, and changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={DownloadIcon}>
            Export
          </Button>
        </div>
      </div>

      {renderStateDemo()}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            variant="search"
            placeholder="Search events, IDs, or references..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />

        </div>

        <Select
          options={[
          {
            value: 'all',
            label: 'All types'
          },
          {
            value: 'document',
            label: 'Documents'
          },
          {
            value: 'email',
            label: 'Emails'
          },
          {
            value: 'deal',
            label: 'Deals'
          },
          {
            value: 'link',
            label: 'Links'
          },
          {
            value: 'system',
            label: 'System'
          }]
          }
          value="all"
          onChange={() => {}}
          placeholder="Event Type" />


        <Select
          options={[
          {
            value: 'all',
            label: 'All actors'
          },
          {
            value: 'user',
            label: 'Users'
          },
          {
            value: 'system',
            label: 'System'
          }]
          }
          value="all"
          onChange={() => {}}
          placeholder="Actor" />


        <div className="flex items-center border border-stroke-hairline rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${viewMode === 'table' ? 'bg-surface-elevated text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>

            <ListIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 ${viewMode === 'timeline' ? 'bg-surface-elevated text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>

            <ClockIcon size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewState === 'loading' &&
      <div className="space-y-4">
          {viewMode === 'table' ?
        <div className="rounded-xl border border-stroke-hairline overflow-hidden bg-surface-primary/60 backdrop-blur-xl p-4">
              <Skeleton
            variant="text"
            width="100%"
            height={40}
            className="mb-4" />

              <Skeleton
            variant="text"
            width="100%"
            height={40}
            className="mb-4" />

              <Skeleton
            variant="text"
            width="100%"
            height={40}
            className="mb-4" />

              <Skeleton variant="text" width="100%" height={40} />
            </div> :

        <SkeletonTimeline items={5} />
        }
        </div>
      }

      {viewState === 'empty' &&
      <EmptyState
        icon={ClockIcon}
        title="No events found"
        description="There are no ledger events matching your current filters. Try adjusting your search."
        action={{
          label: 'Clear filters',
          onClick: () => {}
        }} />

      }

      {viewState === 'error' &&
      <ErrorState
        title="Failed to load ledger"
        description="We couldn't retrieve the activity ledger. Please check your connection and try again."
        onRetry={() => setViewState('default')} />

      }

      {viewState === 'default' && viewMode === 'table' &&
      <Table
        columns={columns}
        data={ledgerEvents}
        onRowClick={(row) => setSelectedEvent(row)}
        rowActions={(row) =>
        <button className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors">
              <ChevronRightIcon size={16} />
            </button>
        } />

      }

      {viewState === 'default' && viewMode === 'timeline' &&
      <Card className="p-6">
          <Timeline events={ledgerEvents} groupByDay={true} />
        </Card>
      }

      {/* Event Detail Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        description={selectedEvent?.id}
        size="md">

        {selectedEvent &&
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div
              className={`p-3 rounded-xl bg-${eventTypeColors[selectedEvent.type]}-dim`}>

                {createElement(eventTypeIcons[selectedEvent.type], {
                size: 24,
                className: `text-${eventTypeColors[selectedEvent.type]}`
              })}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {selectedEvent.title}
                </h3>
                <p className="text-text-secondary">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-elevated border border-stroke-hairline">
              <div>
                <p className="text-xs text-text-tertiary mb-1">Timestamp</p>
                <p className="text-sm font-mono text-text-primary">
                  {new Date(selectedEvent.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Actor</p>
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-text-tertiary" />
                  <span className="text-sm text-text-primary">
                    {selectedEvent.actor}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Type</p>
                <Badge
                color={eventTypeColors[selectedEvent.type] as any}
                size="sm">

                  {selectedEvent.type}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Status</p>
                <Badge color="success" size="sm" dot>
                  Committed
                </Badge>
              </div>
            </div>

            {/* Structured Data */}
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                Structured Data
              </h4>
              <div className="p-4 rounded-xl bg-bg-deep border border-stroke-hairline font-mono text-xs">
                {Object.entries(selectedEvent.metadata).map(([key, value]) =>
              <div key={key} className="flex mb-1 last:mb-0">
                    <span className="text-accent-cyan w-32 shrink-0">
                      {key}:
                    </span>
                    <span className="text-text-primary">{value}</span>
                  </div>
              )}
              </div>
            </div>

            {/* References */}
            {selectedEvent.references.length > 0 &&
          <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">
                  References
                </h4>
                <div className="space-y-2">
                  {selectedEvent.references.map((ref) =>
              <div
                key={ref}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-stroke-hairline hover:border-stroke-subtle transition-colors cursor-pointer">

                      <div className="flex items-center gap-3">
                        <LinkIcon size={16} className="text-text-tertiary" />
                        <span className="text-sm font-mono text-text-primary">
                          {ref}
                        </span>
                      </div>
                      <ChevronRightIcon
                  size={16}
                  className="text-text-tertiary" />

                    </div>
              )}
                </div>
              </div>
          }

            {/* Technical Details */}
            <div className="pt-6 border-t border-stroke-hairline">
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                Technical Details
              </h4>
              <div className="space-y-2 text-xs text-text-tertiary font-mono">
                <div className="flex justify-between">
                  <span>Block Hash</span>
                  <span className="text-text-quaternary">0x7f8a...9b2c</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Hash</span>
                  <span className="text-text-quaternary">0x3e1d...4a5f</span>
                </div>
                <div className="flex justify-between">
                  <span>Signature</span>
                  <span className="text-text-quaternary">Valid (RSA-2048)</span>
                </div>
              </div>
            </div>
          </div>
        }
      </Drawer>
    </div>);

}