import React, { forwardRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { PayoutRecord, SupplierStatement, SupplierProfile } from '@/types';

interface AirportTransferInvoiceDocumentProps {
  payout?: PayoutRecord | null;
  statement?: SupplierStatement | null;
  supplier: SupplierProfile | null;
}

export const AirportTransferInvoiceDocument = forwardRef<HTMLDivElement, AirportTransferInvoiceDocumentProps>(
  ({ payout, statement, supplier }, ref) => {
    const formatDate = (dateString?: string | null) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const statementNo =
      statement?.statementNo ||
      (payout?.id ? payout.id.substring(0, 8).toUpperCase() : 'DOCUMENT');
    const periodStart = statement?.periodStart || payout?.periodStart || payout?.createdAt || '';
    const periodEnd = statement?.periodEnd || payout?.periodEnd || payout?.processedAt || payout?.createdAt || '';

    const d = payout?.details || {};

    const cancelFees = Number(d.userCancellationFees || d.totalCancellations || 0);
    const refunds = Number(d.totalRefunds || 0);
    const netEarned = Number(d.totalSettledEarned || payout?.amount || 0);
    const grossEarned = Number(d.totalGrossEarned || netEarned);

    const previouslyPaid = Number(d.totalAlreadyPaid || 0);
    const payoutAmount = Number(payout?.amount || 0);
    const totalPaidOut = previouslyPaid + payoutAmount;
    const remainingBalance = Number(d.remainingPendingAfterThis || 0);

    const status = payout?.status || 'COMPLETED';

    return (
      <div
        ref={ref}
        className="bg-white text-black w-full"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '12mm 15mm',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[#FACC15] tracking-tight">GOZOLT</h1>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-sm mt-1">
              Airport Transfers · Supplier Portal
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">
              Invoice
            </h2>
            <p className="text-gray-500 font-medium mt-1">#{statementNo}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Billed To
            </h3>
            <div className="text-gray-800 font-medium leading-relaxed">
              <p className="text-lg font-bold">{supplier?.companyName || 'Airport Transport Supplier'}</p>
              {supplier?.vatNumber && <p>VAT: {supplier.vatNumber}</p>}
              {supplier?.address && <p>{supplier.address}</p>}
              {supplier?.city && (
                <p>
                  {supplier.city}
                  {supplier?.postalCode ? `, ${supplier.postalCode}` : ''}
                </p>
              )}
              {supplier?.country && <p>{supplier.country}</p>}
              <p className="mt-1 text-gray-500">{supplier?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              From
            </h3>
            <div className="text-gray-800 font-medium leading-relaxed">
              <p className="text-lg font-bold">Gozolt Technologies Ltd.</p>
              <p>123 Innovation Drive</p>
              <p>Tech District, 10001</p>
              <p>support@gozolt.com</p>
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="flex gap-12 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Period Start
            </p>
            <p className="font-semibold text-gray-800">{formatDate(periodStart)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Period End
            </p>
            <p className="font-semibold text-gray-800">{formatDate(periodEnd)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Status
            </p>
            <p className="font-semibold text-green-600">{status}</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left">
              <th className="py-2 text-sm font-bold text-gray-800 uppercase tracking-wider">
                Description
              </th>
              <th className="py-2 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {/* Service Name */}
            <tr className="border-b border-gray-100">
              <td className="py-2 font-medium">Service Name</td>
              <td className="py-2 text-right font-bold text-gray-900">
                Airport Transfers
              </td>
            </tr>

            {/* Total Earned Amount */}
            <tr className="border-b border-gray-100">
              <td className="py-2 font-medium">Total Earned Amount</td>
              <td className="py-2 text-right font-medium">
                {formatCurrency(grossEarned)}
              </td>
            </tr>

            {/* Platform Commission (0%) */}
            <tr className="border-b border-gray-100">
              <td className="py-2 font-medium">Platform Commission (0%)</td>
              <td className="py-2 text-right font-medium text-green-600">
                €0.00
              </td>
            </tr>

            {/* Refunded / Cancellation */}
            {(cancelFees > 0 || refunds > 0) && (
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">Refunded / Cancellation</td>
                <td className="py-2 text-right font-medium text-red-600">
                  -{formatCurrency(refunds || cancelFees)}
                </td>
              </tr>
            )}

            {/* Total Paid Out */}
            <tr className="border-b border-gray-100">
              <td className="py-2 font-medium">Total Paid Out</td>
              <td className="py-2 text-right font-bold text-[#22C55E]">
                {formatCurrency(totalPaidOut)}
              </td>
            </tr>

            {/* Remaining Balance */}
            <tr className="border-b border-gray-100">
              <td className="py-2 font-medium">Remaining Balance</td>
              <td className="py-2 text-right font-bold text-[#EAB308]">
                {formatCurrency(remainingBalance)}
              </td>
            </tr>

            {/* Payout Date */}
            <tr className="border-b border-gray-100">
              <td className="py-2 font-medium">Payout Date</td>
              <td className="py-2 text-right font-bold text-gray-900">
                {formatDate(payout?.processedAt || payout?.createdAt || periodEnd)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-2/3">
            <div className="flex justify-between py-3 bg-gray-50 px-4 rounded-lg font-bold text-lg text-gray-900 border border-gray-200">
              <span>9-Days Settlement Amount</span>
              <span className="text-gray-900">{formatCurrency(payoutAmount)}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-sm text-gray-500">
            * Note: All airport transfer bookings are prepaid via electronic card/online transactions with 0% platform commission deducted.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 font-medium">
          <p>Thank you for partnering with Gozolt.</p>
          <p className="mt-1">If you have any questions about this invoice, please contact support@gozolt.com.</p>
        </div>
      </div>
    );
  }
);

AirportTransferInvoiceDocument.displayName = 'AirportTransferInvoiceDocument';
