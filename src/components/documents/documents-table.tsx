'use client';

import { FileText, Upload as UploadIcon } from 'lucide-react';
import { DocumentStatusBadge } from './document-status-badge';
import { formatDocumentType } from '@/lib/utils';
import type { DocumentCenterItem, DocumentTab } from '@/types';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

interface DocumentsTableProps {
  documents: DocumentCenterItem[];
  tab: DocumentTab;
  isLoading: boolean;
  onReUpload: (doc: DocumentCenterItem) => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '——';
  return new Date(dateStr).toLocaleDateString('en-CA');
}

function getDocumentLabel(doc: DocumentCenterItem, tab: DocumentTab): React.ReactNode {
  const typeName = formatDocumentType(doc.type);

  if (tab === 'Vehicle' && doc.vehiclePlate) {
    return (
      <>
        <span className="font-medium text-white">{doc.vehiclePlate}</span>
        <span className="text-[#A1A1AA]"> — {typeName}</span>
      </>
    );
  }

  if (tab === 'Driver' && doc.driverName) {
    return (
      <>
        <span className="font-medium text-white">{doc.driverName}</span>
        <span className="text-[#A1A1AA]"> — {typeName}</span>
      </>
    );
  }

  return <span className="text-white">{typeName}</span>;
}

export function DocumentsTable({ 
  documents, 
  tab, 
  isLoading, 
  onReUpload,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange 
}: DocumentsTableProps) {
  
  const columns: ColumnDef<DocumentCenterItem>[] = [
    {
      key: 'document',
      title: 'Document',
      render: (doc) => (
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
          <span className="text-sm">{getDocumentLabel(doc, tab)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (doc) => <DocumentStatusBadge status={doc.status} />,
    },
    {
      key: 'expiry',
      title: 'Expiry',
      render: (doc) => (
        <span className="text-sm text-[#D4D4D8]">{formatDate(doc.expiresAt)}</span>
      ),
    },
    {
      key: 'uploaded',
      title: 'Uploaded',
      render: (doc) => (
        <span className="text-sm text-[#D4D4D8]">{formatDate(doc.createdAt)}</span>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      render: (doc) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReUpload(doc);
          }}
          className="flex items-center gap-1.5 text-sm text-[#FACC15] hover:underline"
        >
          <UploadIcon className="h-3.5 w-3.5" />
          Re-Upload
        </button>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable<DocumentCenterItem>
        columns={columns}
        data={documents}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText={
          <div className="py-8">
            <FileText className="mx-auto mb-3 h-10 w-10 text-[#52525B]" />
            <p className="text-sm text-[#71717A]">
              No {tab.toLowerCase()} documents found
            </p>
          </div>
        }
      />
    </div>
  );
}
