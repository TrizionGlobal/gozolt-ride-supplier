import { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { InvoiceDocument } from './invoice-document';
import type { SupplierStatement, SupplierProfile } from '@/types';
import { invoiceService } from '@/services/invoices/invoice.service';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  statement: SupplierStatement | null;
  supplier: SupplierProfile | null;
}

export function InvoicePreviewModal({ isOpen, onClose, statement, supplier }: InvoicePreviewModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Gozolt_Invoice_${statement?.statementNo || 'Document'}`,
  });

  if (!isOpen || !statement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-[#27272A] bg-[#0A0A0A] shadow-2xl">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-[#27272A] p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Invoice Preview</h2>
            <p className="text-sm text-[#71717A]">Statement #{statement.statementNo}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={() => invoiceService.downloadStatement(statement.id)}
              className="flex items-center gap-2 rounded-lg border border-[#3F3F46] bg-[#27272A] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F3F46] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="ml-2 rounded-full p-2 text-[#71717A] hover:bg-[#27272A] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900 flex justify-center custom-scrollbar">
          {/* We wrap the document in a container that looks like a page on screen */}
          <div className="shadow-xl ring-1 ring-black/5 rounded-sm overflow-hidden bg-white max-w-[210mm] w-full">
             <InvoiceDocument ref={contentRef} statement={statement} supplier={supplier} />
          </div>
        </div>
      </div>
    </div>
  );
}
