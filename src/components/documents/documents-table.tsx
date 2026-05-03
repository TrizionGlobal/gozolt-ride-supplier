'use client';

import { FileText, Upload as UploadIcon } from 'lucide-react';
import { DocumentStatusBadge } from './document-status-badge';
import { formatDocumentType } from '@/lib/utils';
import type { DocumentCenterItem, DocumentTab } from '@/types';

interface DocumentsTableProps {
  documents: DocumentCenterItem[];
  tab: DocumentTab;
  isLoading: boolean;
  onReUpload: (doc: DocumentCenterItem) => void;
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

export function DocumentsTable({ documents, tab, isLoading, onReUpload }: DocumentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111]">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-[#27272A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-12 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-[#52525B]" />
        <p className="text-sm text-[#71717A]">
          No {tab.toLowerCase()} documents uploaded yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Document</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
                    <span className="text-sm">{getDocumentLabel(doc, tab)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <DocumentStatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">
                  {formatDate(doc.expiresAt)}
                </td>
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onReUpload(doc)}
                    className="flex items-center gap-1.5 text-sm text-[#FACC15] hover:underline"
                  >
                    <UploadIcon className="h-3.5 w-3.5" />
                    Re-Upload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
