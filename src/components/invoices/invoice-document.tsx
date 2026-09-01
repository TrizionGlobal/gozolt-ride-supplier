import React, { forwardRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { PayoutRecord, SupplierProfile } from '@/types';

interface InvoiceDocumentProps {
  payout: PayoutRecord;
  supplier: SupplierProfile | null;
}

export const InvoiceDocument = forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  ({ payout, supplier }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const statementNo = payout.id.substring(0, 8).toUpperCase();
    const periodStart = payout.periodStart || payout.createdAt;
    const periodEnd = payout.periodEnd || payout.processedAt || payout.createdAt;

    const cab = Number(payout.details?.breakdown?.cab || 0);
    const carRental = Number(payout.details?.breakdown?.carRental || 0);
    const bikeRental = Number(payout.details?.breakdown?.bikeRental || 0);
    const totalGross = cab + carRental + bikeRental;

    // We can assume total deductions are the difference between gross and net
    const netAmount = Number(payout.amount || 0);
    const deductions = totalGross > 0 ? Math.max(0, totalGross - netAmount) : 0;

    return (
      <div
        ref={ref}
        className="bg-white p-12 text-black w-full"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-[#FACC15] tracking-tight">GOZOLT</h1>
            <p className="text-gray-500 font-medium tracking-widest uppercase text-sm mt-1">
              Supplier Portal
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
        <div className="flex justify-between mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Billed To
            </h3>
            <div className="text-gray-800 font-medium leading-relaxed">
              <p className="text-lg font-bold">{supplier?.companyName || 'Supplier Company'}</p>
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
        <div className="flex gap-12 mb-12 bg-gray-50 p-6 rounded-lg border border-gray-100">
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
            <p className="font-semibold text-green-600">{payout.status}</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left">
              <th className="py-3 text-sm font-bold text-gray-800 uppercase tracking-wider">
                Description
              </th>
              <th className="py-3 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {cab > 0 && (
              <tr className="border-b border-gray-100">
                <td className="py-5 font-medium">Cab Bookings Revenue</td>
                <td className="py-5 text-right font-medium">
                  {formatCurrency(cab)}
                </td>
              </tr>
            )}
            {carRental > 0 && (
              <tr className="border-b border-gray-100">
                <td className="py-5 font-medium">Car Rentals Revenue</td>
                <td className="py-5 text-right font-medium">
                  {formatCurrency(carRental)}
                </td>
              </tr>
            )}
            {bikeRental > 0 && (
              <tr className="border-b border-gray-100">
                <td className="py-5 font-medium">Bike Rentals Revenue</td>
                <td className="py-5 text-right font-medium">
                  {formatCurrency(bikeRental)}
                </td>
              </tr>
            )}
            {totalGross === 0 && (
              <tr className="border-b border-gray-100">
                <td className="py-5 font-medium">Gross Revenue</td>
                <td className="py-5 text-right font-medium">
                  {formatCurrency(0)}
                </td>
              </tr>
            )}
            {deductions > 0 && (
              <tr className="border-b border-gray-100">
                <td className="py-5 font-medium">Platform Commission (Deduction)</td>
                <td className="py-5 text-right font-medium text-red-600">
                  -{formatCurrency(deductions)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(totalGross)}</span>
            </div>
            <div className="flex justify-between py-4 mt-2 bg-gray-50 px-4 rounded-lg font-bold text-xl text-gray-900 border border-gray-200">
              <span>Net Balance</span>
              <span className="text-[#EAB308]">{formatCurrency(netAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-gray-200 text-center text-sm text-gray-400 font-medium">
          <p>Thank you for partnering with Gozolt.</p>
          <p className="mt-1">If you have any questions about this invoice, please contact support@gozolt.com.</p>
        </div>
      </div>
    );
  }
);

InvoiceDocument.displayName = 'InvoiceDocument';
