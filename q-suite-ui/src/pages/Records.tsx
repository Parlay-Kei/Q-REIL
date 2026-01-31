import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  UsersIcon,
  BuildingIcon,
  HomeIcon,
  BriefcaseIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  LinkIcon,
  ChevronRightIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { Table, StatusPill } from '../components/ui/Table';
interface RecordsProps {
  defaultTab?: 'contacts' | 'companies' | 'properties' | 'deals';
}
const recordTabs = [
{
  id: 'contacts',
  label: 'Contacts',
  icon: <UsersIcon size={16} />,
  count: 284
},
{
  id: 'companies',
  label: 'Companies',
  icon: <BuildingIcon size={16} />,
  count: 156
},
{
  id: 'properties',
  label: 'Properties',
  icon: <HomeIcon size={16} />,
  count: 42
},
{
  id: 'deals',
  label: 'Deals',
  icon: <BriefcaseIcon size={16} />,
  count: 67
}];

const contacts = [
{
  id: 'con-001',
  name: 'James Wilson',
  email: 'james@meridiancp.com',
  company: 'Meridian Capital Partners',
  role: 'Managing Partner',
  lastActivity: '2 hours ago',
  openItems: 3,
  owner: 'Sarah Chen',
  status: 'active' as const
},
{
  id: 'con-002',
  name: 'Sarah Chen',
  email: 'sarah@apexholdings.com',
  company: 'Apex Holdings',
  role: 'CFO',
  lastActivity: '4 hours ago',
  openItems: 1,
  owner: 'Alex Morgan',
  status: 'active' as const
},
{
  id: 'con-003',
  name: 'Michael Torres',
  email: 'mtorres@pinnacle.io',
  company: 'Pinnacle Investments',
  role: 'Director',
  lastActivity: 'Yesterday',
  openItems: 2,
  owner: 'Emily Park',
  status: 'active' as const
},
{
  id: 'con-004',
  name: 'Emily Park',
  email: 'emily@horizongroup.com',
  company: 'Horizon Group',
  role: 'VP Business Development',
  lastActivity: '2 days ago',
  openItems: 0,
  owner: 'Michael Torres',
  status: 'inactive' as const
},
{
  id: 'con-005',
  name: 'David Kim',
  email: 'dkim@sterling.com',
  company: 'Sterling Partners',
  role: 'Investment Analyst',
  lastActivity: '3 days ago',
  openItems: 5,
  owner: 'Sarah Chen',
  status: 'active' as const
}];

const companies = [
{
  id: 'com-001',
  name: 'Meridian Capital Partners',
  industry: 'Private Equity',
  contacts: 8,
  deals: 2,
  lastActivity: '2 hours ago',
  owner: 'Sarah Chen',
  status: 'active' as const
},
{
  id: 'com-002',
  name: 'Apex Holdings',
  industry: 'Investment Management',
  contacts: 5,
  deals: 1,
  lastActivity: '4 hours ago',
  owner: 'Alex Morgan',
  status: 'active' as const
},
{
  id: 'com-003',
  name: 'Pinnacle Investments',
  industry: 'Venture Capital',
  contacts: 3,
  deals: 1,
  lastActivity: 'Yesterday',
  owner: 'Emily Park',
  status: 'active' as const
}];

export function Records({ defaultTab = 'contacts' }: RecordsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const pageLabel = defaultTab === 'deals' ? 'Deals' : 'Records';
  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW(pageLabel);
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, [pageLabel]);
  const contactColumns = [
  {
    key: 'name',
    header: 'Name',
    width: '25%',
    render: (value: string, row: (typeof contacts)[0]) =>
    <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-tertiary">{row.email}</p>
          </div>
        </div>

  },
  {
    key: 'company',
    header: 'Company',
    width: '20%',
    render: (value: string, row: (typeof contacts)[0]) =>
    <div>
          <p className="text-text-primary">{row.company}</p>
          <p className="text-xs text-text-tertiary">{row.role}</p>
        </div>

  },
  {
    key: 'lastActivity',
    header: 'Last Activity',
    width: '15%',
    render: (value: string) =>
    <span className="text-text-secondary font-mono text-sm">{value}</span>

  },
  {
    key: 'openItems',
    header: 'Open Items',
    width: '10%',
    align: 'center' as const,
    render: (value: number) =>
    <Badge color={value > 0 ? 'warning' : 'neutral'} size="sm">
          {value}
        </Badge>

  },
  {
    key: 'owner',
    header: 'Owner',
    width: '15%',
    render: (value: string) =>
    <div className="flex items-center gap-2">
          <Avatar name={value} size="xs" />
          <span className="text-text-secondary text-sm">{value}</span>
        </div>

  },
  {
    key: 'status',
    header: 'Status',
    width: '10%',
    render: (value: 'active' | 'inactive') => <StatusPill status={value} />
  }];

  const companyColumns = [
  {
    key: 'name',
    header: 'Company',
    width: '30%',
    render: (value: string, row: (typeof companies)[0]) =>
    <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center">
            <BuildingIcon size={18} className="text-text-tertiary" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-tertiary">{row.industry}</p>
          </div>
        </div>

  },
  {
    key: 'contacts',
    header: 'Contacts',
    width: '15%',
    align: 'center' as const,
    render: (value: number) =>
    <span className="text-text-secondary">{value}</span>

  },
  {
    key: 'deals',
    header: 'Deals',
    width: '15%',
    align: 'center' as const,
    render: (value: number) =>
    <Badge color={value > 0 ? 'cyan' : 'neutral'} size="sm">
          {value}
        </Badge>

  },
  {
    key: 'lastActivity',
    header: 'Last Activity',
    width: '15%',
    render: (value: string) =>
    <span className="text-text-secondary font-mono text-sm">{value}</span>

  },
  {
    key: 'owner',
    header: 'Owner',
    width: '15%',
    render: (value: string) =>
    <div className="flex items-center gap-2">
          <Avatar name={value} size="xs" />
          <span className="text-text-secondary text-sm">{value}</span>
        </div>

  },
  {
    key: 'status',
    header: 'Status',
    width: '10%',
    render: (value: 'active' | 'inactive') => <StatusPill status={value} />
  }];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <ReilBreadcrumb items={[{ label: pageLabel }]} className="mb-4" />
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
            {pageLabel}
          </h1>
          <p className="text-text-secondary">
            Manage contacts, companies, properties, and deals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={LinkIcon}>
            Quick link
          </Button>
          <Button variant="primary" leftIcon={PlusIcon}>
            Create record
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={recordTabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as 'contacts' | 'companies' | 'properties' | 'deals')}
          variant="default" />

      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            variant="search"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />

        </div>
        <Button variant="secondary" leftIcon={FilterIcon}>
          Filters
        </Button>
      </div>

      {/* Table */}
      {activeTab === 'contacts' &&
      <Table
        columns={contactColumns}
        data={contacts}
        onRowClick={() => navigate(`/reil/records`)}
        rowActions={(row) =>
        <button className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors">
              <MoreHorizontalIcon size={16} />
            </button>
        } />

      }

      {activeTab === 'companies' &&
      <Table
        columns={companyColumns}
        data={companies}
        onRowClick={(row) => navigate(`/reil/records`)}
        rowActions={(row) =>
        <button className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors">
              <MoreHorizontalIcon size={16} />
            </button>
        } />

      }

      {(activeTab === 'properties' || activeTab === 'deals') &&
      <Card className="p-12 text-center">
          <p className="text-text-tertiary">
            {activeTab === 'properties' ? 'Properties' : 'Deals'} view coming
            soon
          </p>
        </Card>
      }
    </div>);

}