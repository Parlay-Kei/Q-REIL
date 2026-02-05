import React, { useState, useEffect } from 'react';
import { DEFAULT_DOCUMENT_TITLE, TITLE_REIL_SUBVIEW } from '../constants/brand';
import { REIL_DEFAULT_ORG_ID } from '../constants/inbox';
import { ReilBreadcrumb } from '../components/layout/ReilBreadcrumb';
import {
  FileTextIcon,
  SearchIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  UploadIcon,
  MoreHorizontalIcon,
  LinkIcon,
  DownloadIcon,
  EyeIcon,
  TrashIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  FileIcon,
  MailIcon,
  FolderIcon,
  XIcon } from
'lucide-react';
import { fetchReilDocuments } from '../lib/reilRecordsApi';
import { documentsToCsv, documentsToJson, downloadCsv, downloadJson } from '../lib/reilExport';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
type ViewState = 'default' | 'loading' | 'empty' | 'error';
type ViewMode = 'list' | 'grid';
const documents = [
{
  id: 'doc-001',
  name: 'Q3 Financial Report.pdf',
  type: 'PDF',
  size: '2.4 MB',
  source: 'Gmail',
  sourceThread: 'RE: Q3 Investment Proposal',
  linkedRecord: {
    type: 'Deal',
    name: 'Meridian Capital Partners'
  },
  uploadedBy: 'Sarah Chen',
  date: 'Jan 30, 2025'
},
{
  id: 'doc-002',
  name: 'Investment Term Sheet.docx',
  type: 'DOCX',
  size: '890 KB',
  source: 'Outlook',
  sourceThread: 'Due Diligence Documents',
  linkedRecord: null,
  uploadedBy: 'System',
  date: 'Jan 29, 2025'
},
{
  id: 'doc-003',
  name: 'Financial Model.xlsx',
  type: 'XLSX',
  size: '1.8 MB',
  source: 'Google Drive',
  sourceThread: null,
  linkedRecord: {
    type: 'Deal',
    name: 'Apex Holdings'
  },
  uploadedBy: 'Alex Morgan',
  date: 'Jan 28, 2025'
},
{
  id: 'doc-004',
  name: 'NDA_Meridian_2024.pdf',
  type: 'PDF',
  size: '156 KB',
  source: 'Gmail',
  sourceThread: 'Contract Review',
  linkedRecord: {
    type: 'Company',
    name: 'Meridian Capital Partners'
  },
  uploadedBy: 'Michael Torres',
  date: 'Jan 25, 2025'
},
{
  id: 'doc-005',
  name: 'Presentation Deck.pptx',
  type: 'PPTX',
  size: '4.2 MB',
  source: 'Dropbox',
  sourceThread: null,
  linkedRecord: {
    type: 'Deal',
    name: 'Pinnacle Investments'
  },
  uploadedBy: 'Emily Park',
  date: 'Jan 22, 2025'
},
{
  id: 'doc-006',
  name: 'Due Diligence Checklist.xlsx',
  type: 'XLSX',
  size: '245 KB',
  source: 'Manual Upload',
  sourceThread: null,
  linkedRecord: null,
  uploadedBy: 'David Kim',
  date: 'Jan 20, 2025'
}];

const typeIcons: Record<string, typeof FileTextIcon> = {
  PDF: FileTextIcon,
  DOCX: FileTextIcon,
  XLSX: FileSpreadsheetIcon,
  PPTX: FileTextIcon,
  PNG: ImageIcon,
  JPG: ImageIcon
};
export function Documents() {
  useEffect(() => {
    document.title = TITLE_REIL_SUBVIEW('Documents');
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  const [viewState, setViewState] = useState<ViewState>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDoc, setSelectedDoc] = useState<(typeof documents)[0] | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const columns = [
  {
    key: 'name',
    header: 'Name',
    width: '30%',
    render: (value: string, row: (typeof documents)[0]) => {
      const Icon = typeIcons[row.type] || FileIcon;
      return (
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-elevated">
              <Icon size={18} className="text-text-tertiary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{row.name}</p>
              <p className="text-xs text-text-tertiary">{row.size}</p>
            </div>
          </div>);

    }
  },
  {
    key: 'source',
    header: 'Source',
    width: '15%',
    render: (value: string, row: (typeof documents)[0]) =>
    <div>
          <p className="text-text-secondary">{row.source}</p>
          {row.sourceThread &&
      <p className="text-xs text-text-tertiary truncate max-w-[150px]">
              {row.sourceThread}
            </p>
      }
        </div>

  },
  {
    key: 'linkedRecord',
    header: 'Linked To',
    width: '20%',
    render: (value: (typeof documents)[0]['linkedRecord']) =>
    value ?
    <Badge color="success" size="sm" dot>
            {value.type}: {value.name}
          </Badge> :

    <Badge color="warning" size="sm">
            Unlinked
          </Badge>

  },
  {
    key: 'uploadedBy',
    header: 'Uploaded By',
    width: '15%',
    render: (value: string) =>
    <span className="text-text-secondary text-sm">{value}</span>

  },
  {
    key: 'date',
    header: 'Date',
    width: '15%',
    render: (value: string) =>
    <span className="text-text-secondary font-mono text-sm">{value}</span>

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
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          <ReilBreadcrumb items={[{ label: 'Documents' }]} className="mb-4" />
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
                Documents
              </h1>
              <p className="text-text-secondary">
                Attachment library with full provenance tracking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {REIL_DEFAULT_ORG_ID && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={DownloadIcon}
                    onClick={async () => {
                      const { documents, error } = await fetchReilDocuments({ limit: 500 });
                      const csv = documentsToCsv(error ? [] : documents);
                      downloadCsv(csv, `reil-documents-${new Date().toISOString().slice(0, 10)}.csv`);
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={DownloadIcon}
                    onClick={async () => {
                      const { documents, error } = await fetchReilDocuments({ limit: 500 });
                      const json = documentsToJson(error ? [] : documents);
                      downloadJson(json, `reil-documents-${new Date().toISOString().slice(0, 10)}.json`);
                    }}
                  >
                    Export JSON
                  </Button>
                </>
              )}
              <Button variant="secondary" leftIcon={UploadIcon}>
                Upload
              </Button>
            </div>
          </div>

          {renderStateDemo()}

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                variant="search"
                placeholder="Search documents..."
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
                value: 'pdf',
                label: 'PDF'
              },
              {
                value: 'docx',
                label: 'Word'
              },
              {
                value: 'xlsx',
                label: 'Excel'
              }]
              }
              value="all"
              onChange={() => {}}
              placeholder="Type" />


            <Select
              options={[
              {
                value: 'all',
                label: 'All sources'
              },
              {
                value: 'gmail',
                label: 'Gmail'
              },
              {
                value: 'outlook',
                label: 'Outlook'
              },
              {
                value: 'drive',
                label: 'Google Drive'
              }]
              }
              value="all"
              onChange={() => {}}
              placeholder="Source" />


            <div className="flex items-center border border-stroke-hairline rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-surface-elevated text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>

                <ListIcon size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-surface-elevated text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>

                <GridIcon size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          {viewState === 'loading' &&
          <div className="space-y-3">
              {Array.from({
              length: 5
            }).map((_, i) =>
            <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton
                  variant="rectangular"
                  width={48}
                  height={48}
                  className="rounded-lg" />

                    <div className="flex-1">
                      <Skeleton variant="text" width="40%" className="mb-2" />
                      <Skeleton variant="text" width="20%" height={14} />
                    </div>
                    <Skeleton variant="text" width={80} />
                  </div>
                </Card>
            )}
            </div>
          }

          {viewState === 'empty' &&
          <EmptyState
            icon={FolderIcon}
            title="No documents found"
            description="There are no documents matching your current filters. Try adjusting your search or upload a new document."
            action={{
              label: 'Upload document',
              onClick: () => {},
              icon: UploadIcon
            }} />

          }

          {viewState === 'error' &&
          <ErrorState
            title="Failed to load documents"
            description="We couldn't retrieve your documents. Please check your connection and try again."
            onRetry={() => setViewState('default')} />

          }

          {viewState === 'default' && viewMode === 'list' &&
          <Table
            columns={columns}
            data={documents}
            onRowClick={(row) => setSelectedDoc(row)}
            rowActions={(row) =>
            <button className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors">
                  <MoreHorizontalIcon size={16} />
                </button>
            } />

          }

          {viewState === 'default' && viewMode === 'grid' &&
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.map((doc) => {
              const Icon = typeIcons[doc.type] || FileIcon;
              return (
                <Card
                  key={doc.id}
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}>

                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 rounded-xl bg-surface-elevated mb-3">
                        <Icon size={32} className="text-text-tertiary" />
                      </div>
                      <p className="text-sm font-medium text-text-primary truncate w-full mb-1">
                        {doc.name}
                      </p>
                      <p className="text-xs text-text-tertiary mb-2">
                        {doc.size}
                      </p>
                      {doc.linkedRecord ?
                    <Badge color="success" size="sm" dot>
                          Linked
                        </Badge> :

                    <Badge color="warning" size="sm">
                          Unlinked
                        </Badge>
                    }
                    </div>
                  </Card>);

            })}
            </div>
          }
        </div>
      </div>

      {/* Preview Panel */}
      {selectedDoc &&
      <div className="w-96 border-l border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl overflow-y-auto shrink-0">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">
                Document Details
              </h3>
              <button
              onClick={() => setSelectedDoc(null)}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors">

                <XIcon size={18} />
              </button>
            </div>

            {/* Preview placeholder */}
            <div className="aspect-[4/3] rounded-xl bg-surface-elevated flex items-center justify-center mb-4">
              <FileTextIcon size={48} className="text-text-quaternary" />
            </div>

            {/* File info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-tertiary mb-1">File Name</p>
                <p className="text-sm font-medium text-text-primary">
                  {selectedDoc.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Type</p>
                  <p className="text-sm text-text-primary">
                    {selectedDoc.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Size</p>
                  <p className="text-sm text-text-primary">
                    {selectedDoc.size}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-tertiary mb-1">Source</p>
                <p className="text-sm text-text-primary">
                  {selectedDoc.source}
                </p>
                {selectedDoc.sourceThread &&
              <p className="text-xs text-text-tertiary mt-0.5">
                    From: {selectedDoc.sourceThread}
                  </p>
              }
              </div>

              <div>
                <p className="text-xs text-text-tertiary mb-1">Linked Record</p>
                {selectedDoc.linkedRecord ?
              <Badge color="success" dot>
                    {selectedDoc.linkedRecord.type}:{' '}
                    {selectedDoc.linkedRecord.name}
                  </Badge> :

              <Badge color="warning">Unlinked</Badge>
              }
              </div>

              <div>
                <p className="text-xs text-text-tertiary mb-1">Uploaded</p>
                <p className="text-sm text-text-primary">
                  {selectedDoc.date} by {selectedDoc.uploadedBy}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stroke-hairline space-y-2">
              <Button variant="primary" className="w-full" leftIcon={LinkIcon}>
                Link to record
              </Button>
              <Button
              variant="secondary"
              className="w-full"
              leftIcon={DownloadIcon}>

                Download
              </Button>
              <Button variant="ghost" className="w-full" leftIcon={EyeIcon}>
                Open preview
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

}