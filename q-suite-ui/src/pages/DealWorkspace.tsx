import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_DEAL } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  MoreHorizontalIcon,
  EditIcon,
  CheckCircleIcon,
  CircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  MailIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon,
  ClockIcon,
  LinkIcon,
  PlusIcon,
  ChevronRightIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Timeline } from '../components/ui/Timeline';
import { Tabs } from '../components/ui/Tabs';
const deal = {
  id: 'deal-001',
  name: 'Meridian Capital Partners',
  stage: 'Negotiation',
  value: '$2.4M',
  probability: 75,
  owner: 'Sarah Chen',
  createdAt: 'Dec 15, 2024',
  expectedClose: 'Feb 28, 2025',
  description:
  'Strategic investment partnership for Q1 2025 expansion initiative.',
  company: 'Meridian Capital Partners',
  primaryContact: 'James Wilson'
};
const stages = [
{
  id: 'lead',
  label: 'Lead',
  completed: true
},
{
  id: 'qualification',
  label: 'Qualification',
  completed: true
},
{
  id: 'proposal',
  label: 'Proposal',
  completed: true
},
{
  id: 'negotiation',
  label: 'Negotiation',
  completed: false,
  current: true
},
{
  id: 'closed',
  label: 'Closed Won',
  completed: false
}];

const evidenceChecklist = [
{
  id: 'ev-001',
  label: 'Initial Contact',
  completed: true,
  linkedDoc: 'Email thread from Dec 15'
},
{
  id: 'ev-002',
  label: 'NDA Signed',
  completed: true,
  linkedDoc: 'NDA_Meridian_2024.pdf'
},
{
  id: 'ev-003',
  label: 'Requirements Document',
  completed: true,
  linkedDoc: 'Requirements_v2.docx'
},
{
  id: 'ev-004',
  label: 'Proposal Sent',
  completed: true,
  linkedDoc: 'Investment_Proposal.pdf'
},
{
  id: 'ev-005',
  label: 'Financial Statements',
  completed: false,
  linkedDoc: null
},
{
  id: 'ev-006',
  label: 'Term Sheet',
  completed: false,
  linkedDoc: null
},
{
  id: 'ev-007',
  label: 'Legal Review',
  completed: false,
  linkedDoc: null
},
{
  id: 'ev-008',
  label: 'Final Agreement',
  completed: false,
  linkedDoc: null
}];

const relatedActivity = [
{
  id: 'evt-001',
  type: 'email' as const,
  title: 'Email thread updated',
  description: 'New reply from James Wilson regarding investment terms',
  actor: 'System',
  timestamp: new Date().toISOString(),
  references: ['THR-2024-1204']
},
{
  id: 'evt-002',
  type: 'document' as const,
  title: 'Document linked',
  description: 'Investment_Terms_v3.pdf attached to deal',
  actor: 'Sarah Chen',
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  references: ['DOC-2024-0892']
},
{
  id: 'evt-003',
  type: 'deal' as const,
  title: 'Stage updated',
  description: 'Deal moved from Proposal to Negotiation',
  actor: 'Sarah Chen',
  timestamp: new Date(Date.now() - 86400000).toISOString()
},
{
  id: 'evt-004',
  type: 'user' as const,
  title: 'Meeting scheduled',
  description: 'Call with James Wilson scheduled for Thursday',
  actor: 'Alex Morgan',
  timestamp: new Date(Date.now() - 172800000).toISOString()
}];

const relatedDocs = [
{
  id: 'doc-001',
  name: 'Investment_Proposal.pdf',
  type: 'PDF',
  date: 'Jan 15'
},
{
  id: 'doc-002',
  name: 'NDA_Meridian_2024.pdf',
  type: 'PDF',
  date: 'Dec 20'
},
{
  id: 'doc-003',
  name: 'Requirements_v2.docx',
  type: 'DOCX',
  date: 'Jan 10'
},
{
  id: 'doc-004',
  name: 'Financial_Model.xlsx',
  type: 'XLSX',
  date: 'Jan 28'
}];

const relatedContacts = [
{
  id: 'con-001',
  name: 'James Wilson',
  role: 'Managing Partner',
  primary: true
},
{
  id: 'con-002',
  name: 'Lisa Anderson',
  role: 'Legal Counsel',
  primary: false
},
{
  id: 'con-003',
  name: 'Robert Chen',
  role: 'CFO',
  primary: false
}];

export function DealWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');
  const completedEvidence = evidenceChecklist.filter((e) => e.completed).length;
  const totalEvidence = evidenceChecklist.length;
  useEffect(() => {
    document.title = TITLE_REIL_DEAL(deal.name);
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl shrink-0">
        <ReilBreadcrumb
          items={[{ label: 'Deals', path: '/reil/deals' }, { label: deal.name }]}
          className="mb-4"
        />
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/reil/deals')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">

            <ArrowLeftIcon size={18} />
            <span className="text-sm">Back to Deals</span>
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={EditIcon}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" leftIcon={MoreHorizontalIcon}>⋯</Button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning to-danger">
              <BriefcaseIcon size={24} className="text-bg-deep" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary mb-1">
                {deal.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-accent-cyan font-mono">
                  {deal.value}
                </span>
                <Badge color="warning">{deal.stage}</Badge>
                <span className="text-sm text-text-tertiary">
                  {deal.probability}% probability
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Avatar name={deal.owner} size="sm" />
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {deal.owner}
              </p>
              <p className="text-xs text-text-tertiary">Deal Owner</p>
            </div>
          </div>
        </div>

        {/* Stage indicator */}
        <div className="mt-6">
          <div className="flex items-center">
            {stages.map((stage, index) =>
            <Fragment key={stage.id}>
                <div className="flex items-center gap-2">
                  <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${stage.completed ? 'bg-success text-bg-deep' : stage.current ? 'bg-accent-cyan text-bg-deep' : 'bg-surface-elevated text-text-tertiary'}`}>

                    {stage.completed ?
                  <CheckCircleIcon size={16} /> :

                  <span className="text-xs font-semibold">{index + 1}</span>
                  }
                  </div>
                  <span
                  className={`text-sm font-medium ${stage.completed || stage.current ? 'text-text-primary' : 'text-text-tertiary'}`}>

                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 &&
              <div
                className={`flex-1 h-0.5 mx-3 ${stage.completed ? 'bg-success' : 'bg-stroke-hairline'}`} />

              }
              </Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
          {/* Main content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Key fields */}
            <Card className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Company</p>
                  <p className="text-sm font-medium text-text-primary">
                    {deal.company}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">
                    Primary Contact
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {deal.primaryContact}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Created</p>
                  <p className="text-sm font-medium text-text-primary font-mono">
                    {deal.createdAt}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">
                    Expected Close
                  </p>
                  <p className="text-sm font-medium text-text-primary font-mono">
                    {deal.expectedClose}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stroke-hairline">
                <p className="text-xs text-text-tertiary mb-1">Description</p>
                <p className="text-sm text-text-secondary">
                  {deal.description}
                </p>
              </div>
            </Card>

            {/* Evidence Checklist */}
            <Card className="p-5" aurora>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Evidence Checklist
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    {completedEvidence} of {totalEvidence} items completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-surface-elevated overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-teal rounded-full transition-all duration-slow"
                      style={{
                        width: `${completedEvidence / totalEvidence * 100}%`
                      }} />

                  </div>
                  <span className="text-sm font-mono text-accent-cyan">
                    {Math.round(completedEvidence / totalEvidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {evidenceChecklist.map((item) =>
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${item.completed ? 'bg-success-dim/30' : 'bg-surface-elevated hover:bg-surface-hover'}`}>

                    <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${item.completed ? 'bg-success text-bg-deep' : 'border-2 border-stroke-subtle'}`}>

                      {item.completed && <CheckCircleIcon size={12} />}
                    </div>
                    <span
                    className={`flex-1 text-sm ${item.completed ? 'text-text-secondary' : 'text-text-primary'}`}>

                      {item.label}
                    </span>
                    {item.linkedDoc ?
                  <span className="text-xs text-text-tertiary font-mono truncate max-w-[200px]">
                        {item.linkedDoc}
                      </span> :

                  <Button variant="ghost" size="sm" leftIcon={LinkIcon}>
                        Link
                      </Button>
                  }
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Timeline */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">
                  Activity Timeline
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reil/ledger')}>

                  View full ledger
                </Button>
              </div>
              <Timeline events={relatedActivity} groupByDay={false} />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Related Documents */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Documents</h3>
                <Button variant="ghost" size="sm" leftIcon={PlusIcon}>
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {relatedDocs.map((doc) =>
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">

                    <FileTextIcon size={16} className="text-text-tertiary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-text-quaternary">{doc.date}</p>
                    </div>
                    <ChevronRightIcon
                    size={14}
                    className="text-text-quaternary" />

                  </div>
                )}
              </div>
            </Card>

            {/* Related Contacts */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Contacts</h3>
                <Button variant="ghost" size="sm" leftIcon={PlusIcon}>
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {relatedContacts.map((contact) =>
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">

                    <Avatar name={contact.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">
                          {contact.name}
                        </p>
                        {contact.primary &&
                      <Badge color="cyan" size="sm">
                            Primary
                          </Badge>
                      }
                      </div>
                      <p className="text-xs text-text-tertiary">
                        {contact.role}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Related Threads */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">
                  Email Threads
                </h3>
                <Badge color="neutral" size="sm">
                  4
                </Badge>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/reil/inbox')}>

                View linked threads
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>);

}