'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import { documentService } from '@/services/documents/document.service';
import { DocumentsTable } from '@/components/documents/documents-table';
import { UploadDocumentModal } from '@/components/documents/upload-document-modal';
import type { DocumentTab, DocumentCenterItem } from '@/types';

const tabs: DocumentTab[] = ['Company', 'Vehicle', 'Driver'];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<DocumentTab>('Company');
  const [isLoading, setIsLoading] = useState(true);
  const [companyDocs, setCompanyDocs] = useState<DocumentCenterItem[]>([]);
  const [vehicleDocs, setVehicleDocs] = useState<DocumentCenterItem[]>([]);
  const [driverDocs, setDriverDocs] = useState<DocumentCenterItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<DocumentCenterItem | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { company, vehicle, driver } = await documentService.getAllDocuments();
      setCompanyDocs(company);
      setVehicleDocs(vehicle);
      setDriverDocs(driver);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const currentDocs =
    activeTab === 'Company'
      ? companyDocs
      : activeTab === 'Vehicle'
        ? vehicleDocs
        : driverDocs;

  // Stats
  const allDocs = [...companyDocs, ...vehicleDocs, ...driverDocs];
  const totalCount = allDocs.length;
  const approvedCount = allDocs.filter((d) => d.status === 'APPROVED').length;
  const pendingCount = allDocs.filter((d) => d.status === 'PENDING').length;
  const expiredCount = allDocs.filter(
    (d) => d.status === 'EXPIRED' || d.status === 'REJECTED',
  ).length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="mt-1 text-sm text-[#71717A]">
            Manage all company, vehicle, and driver documents
          </p>
        </div>
        <button
          onClick={handleUploadNew}
          className="flex items-center gap-2 rounded-full bg-[#FACC15] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
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
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
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
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
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
              <p className="text-2xl font-bold text-white">{expiredCount}</p>
              <p className="text-xs text-[#71717A]">Expired / Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === t
                ? 'bg-[#FACC15] text-black'
                : 'bg-[#27272A] text-[#D4D4D8] border border-[#3F3F46] hover:bg-[#3F3F46]'
            }`}
          >
            {t}
            <span className="ml-2 text-xs opacity-70">
              (
              {t === 'Company'
                ? companyDocs.length
                : t === 'Vehicle'
                  ? vehicleDocs.length
                  : driverDocs.length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <DocumentsTable
        documents={currentDocs}
        tab={activeTab}
        isLoading={isLoading}
        onReUpload={handleReUpload}
      />

      {/* Upload modal */}
      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefill(null);
        }}
        onUploaded={fetchDocuments}
        defaultTab={activeTab}
        prefill={prefill}
      />
    </div>
  );
}
