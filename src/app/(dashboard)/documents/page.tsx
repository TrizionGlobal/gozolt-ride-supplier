'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, FileText, ShieldCheck, AlertTriangle, Search } from 'lucide-react';
import { documentService } from '@/services/documents/document.service';
import { DocumentsTable } from '@/components/documents/documents-table';
import { UploadDocumentModal } from '@/components/documents/upload-document-modal';
import { ExportButton } from '@/components/ui/export-button';
import { useDebounce } from '@/hooks/use-debounce';
import type { DocumentTab, DocumentCenterItem } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { formatDocumentType } from '@/lib/utils';

const tabs: DocumentTab[] = ['Company', 'Vehicle', 'Driver'];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<DocumentTab>('Company');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<DocumentCenterItem | null>(null);

  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [tableDocs, setTableDocs] = useState<DocumentCenterItem[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, expired: 0 });

  const fetchTableData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await documentService.getPaginatedDocuments({
        page,
        limit,
        tab: activeTab,
        search: debouncedSearchTerm,
        status: statusFilter,
      });
      setTableDocs(res.data);
      setTableTotal(res.total);
      
      // Update stats based on the current tab (optional, or we could fetch global stats from backend)
      setStats({
        total: res.total,
        approved: res.data.filter(d => d.status === 'APPROVED').length,
        pending: res.data.filter(d => d.status === 'PENDING').length,
        expired: res.data.filter(d => d.status === 'EXPIRED' || d.status === 'REJECTED').length,
      });
    } catch (err: any) {
      console.error(err);
      setTableDocs([]);
      setTableTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeTab, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  useFleetTracking({ onRefresh: fetchTableData });

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleReUpload = (doc: DocumentCenterItem) => {
    setPrefill(doc);
    setIsModalOpen(true);
  };

  const handleUploadNew = () => {
    setPrefill(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="mt-1 text-sm text-[#71717A]">
            Manage all company, vehicle, and driver documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            filename={`documents-${activeTab.toLowerCase()}-export`}
            data={tableDocs.map((doc) => ({
              'Type': formatDocumentType(doc.type),
              'Entity': activeTab === 'Vehicle' ? doc.vehiclePlate : activeTab === 'Driver' ? doc.driverName : 'Company',
              'Status': doc.status,
              'Expiry Date': doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString('en-CA') : 'N/A',
              'Uploaded On': new Date(doc.createdAt).toLocaleDateString('en-CA'),
            }))}
          />
          <button
            onClick={handleUploadNew}
            className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-[#71717A]">Total Documents</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <ShieldCheck className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-xs text-[#71717A]">Approved</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-[#71717A]">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.expired}</p>
              <p className="text-xs text-[#71717A]">Expired / Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="mb-4 flex flex-col gap-4 border-b border-[#27272A] sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-6 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t
                  ? 'border-[#FACC15] text-[#FACC15]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-[#3F3F46]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-3 pb-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#FACC15]"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DocumentsTable
        documents={tableDocs}
        tab={activeTab}
        isLoading={isLoading}
        onReUpload={handleReUpload}
        page={page}
        limit={limit}
        total={tableTotal}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Upload modal */}
      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefill(null);
        }}
        onUploaded={fetchTableData}
        defaultTab={activeTab}
        prefill={prefill}
      />
    </div>
  );
}
