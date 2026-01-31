import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, REIL_APP_NAME, REIL_APP_DESCRIPTION, TITLE_REIL_OVERVIEW } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  ZapIcon,
  LinkIcon,
  PlusIcon,
  MailIcon,
  FileTextIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  CheckCircleIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, KPICard } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
const unlinkedThreads = [
{
  id: 'thr-001',
  subject: 'RE: Q3 Investment Proposal',
  from: 'James Wilson',
  email: 'james@meridiancp.com',
  preview: 'Following up on our discussion about the investment terms...',
  timestamp: '2 hours ago',
  attachments: 2
},
{
  id: 'thr-002',
  subject: 'Due Diligence Documents',
  from: 'Sarah Chen',
  email: 'sarah@apexholdings.com',
  preview: 'Please find attached the requested financial statements...',
  timestamp: '4 hours ago',
  attachments: 5
},
{
  id: 'thr-003',
  subject: 'Contract Review - Urgent',
  from: 'Michael Torres',
  email: 'mtorres@pinnacle.io',
  preview: 'Our legal team has reviewed the contract and has some...',
  timestamp: '6 hours ago',
  attachments: 1
},
{
  id: 'thr-004',
  subject: 'Partnership Opportunity',
  from: 'Emily Park',
  email: 'emily@horizongroup.com',
  preview: 'I wanted to reach out regarding a potential partnership...',
  timestamp: 'Yesterday',
  attachments: 0
}];

const recentDocuments = [
{
  id: 'doc-001',
  name: 'Q3 Financial Report.pdf',
  type: 'PDF',
  source: 'Gmail',
  linkedTo: 'Meridian Capital Partners',
  timestamp: '1 hour ago'
},
{
  id: 'doc-002',
  name: 'Investment Term Sheet.docx',
  type: 'DOCX',
  source: 'Outlook',
  linkedTo: null,
  timestamp: '3 hours ago'
},
{
  id: 'doc-003',
  name: 'Due Diligence Checklist.xlsx',
  type: 'XLSX',
  source: 'Google Drive',
  linkedTo: 'Apex Holdings',
  timestamp: '5 hours ago'
}];

const dealsNeedingEvidence = [
{
  id: 'deal-001',
  name: 'Meridian Capital Partners',
  stage: 'Negotiation',
  value: '$2.4M',
  missingItems: ['Signed LOI', 'Financial Statements'],
  owner: 'Sarah Chen'
},
{
  id: 'deal-002',
  name: 'Pinnacle Investments',
  stage: 'Proposal',
  value: '$1.8M',
  missingItems: ['Technical Requirements', 'Budget Approval'],
  owner: 'Michael Torres'
},
{
  id: 'deal-003',
  name: 'Horizon Group',
  stage: 'Qualification',
  value: '$950K',
  missingItems: ['NDA', 'Contact Information'],
  owner: 'Emily Park'
}];

export function REILHome() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = TITLE_REIL_OVERVIEW;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <ReilBreadcrumb items={[{ label: 'Overview' }]} className="mb-4" />
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-teal">
              <ZapIcon size={24} className="text-bg-deep" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {REIL_APP_NAME}
            </h1>
          </div>
          <p className="text-text-secondary">
            {REIL_APP_DESCRIPTION}. Evidence linking & intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={PlusIcon}>
            Create record
          </Button>
          <Button variant="primary" leftIcon={LinkIcon}>
            Link evidence
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KPICard
          title="Unlinked Threads"
          value="47"
          change={-12}
          changeLabel="vs last week"
          icon={MailIcon}
          sparklineData={[65, 58, 52, 55, 48, 50, 47]} />

        <KPICard
          title="Documents Ingested"
          value="284"
          change={18}
          changeLabel="this week"
          icon={FileTextIcon}
          sparklineData={[220, 235, 248, 260, 270, 278, 284]} />

        <KPICard
          title="Deals Needing Evidence"
          value="12"
          change={-5}
          changeLabel="vs last week"
          icon={BriefcaseIcon}
          sparklineData={[18, 16, 15, 14, 13, 12, 12]} />

      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Unlinked Threads Queue */}
        <div className="col-span-12 lg:col-span-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                Unlinked Threads
              </h2>
              <Badge color="warning" size="sm">
                {unlinkedThreads.length} pending
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reil/inbox')}>

              View all
            </Button>
          </div>

          <div className="space-y-3">
            {unlinkedThreads.map((thread) =>
            <Card
              key={thread.id}
              className="p-4 group"
              onClick={() => navigate(`/reil/inbox/${thread.id}`)}>

                <div className="flex gap-3">
                  <Avatar name={thread.from} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-accent-cyan transition-colors">
                        {thread.subject}
                      </h3>
                      <span className="text-xs text-text-quaternary whitespace-nowrap">
                        {thread.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mb-1">
                      {thread.from}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                      {thread.preview}
                    </p>
                    {thread.attachments > 0 &&
                  <div className="flex items-center gap-1 mt-2">
                        <FileTextIcon
                      size={12}
                      className="text-text-quaternary" />

                        <span className="text-xs text-text-tertiary">
                          {thread.attachments} attachments
                        </span>
                      </div>
                  }
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Latest Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Latest Documents
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reil/documents')}>

                View all
              </Button>
            </div>

            <Card className="divide-y divide-stroke-hairline">
              {recentDocuments.map((doc) =>
              <div
                key={doc.id}
                className="p-4 flex items-center gap-4 hover:bg-surface-hover transition-colors">

                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <FileTextIcon size={18} className="text-text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-quaternary">
                        {doc.source}
                      </span>
                      <span className="text-text-quaternary">·</span>
                      <span className="text-xs text-text-quaternary">
                        {doc.timestamp}
                      </span>
                    </div>
                  </div>
                  {doc.linkedTo ?
                <Badge color="success" size="sm" dot>
                      Linked
                    </Badge> :

                <Button variant="ghost" size="sm" leftIcon={LinkIcon}>
                      Link
                    </Button>
                }
                </div>
              )}
            </Card>
          </div>

          {/* Deals Needing Evidence */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-text-primary">
                  Deals Needing Evidence
                </h2>
                <Badge color="danger" size="sm">
                  {dealsNeedingEvidence.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reil/deals')}>

                View all
              </Button>
            </div>

            <div className="space-y-3">
              {dealsNeedingEvidence.map((deal) =>
              <Card
                key={deal.id}
                className="p-4"
                onClick={() => navigate(`/reil/deals/${deal.id}`)}>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">
                        {deal.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color="neutral" size="sm">
                          {deal.stage}
                        </Badge>
                        <span className="text-sm font-mono text-accent-cyan">
                          {deal.value}
                        </span>
                      </div>
                    </div>
                    <Avatar name={deal.owner} size="xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircleIcon size={14} className="text-warning" />
                    <span className="text-xs text-text-tertiary">
                      Missing: {deal.missingItems.join(', ')}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}