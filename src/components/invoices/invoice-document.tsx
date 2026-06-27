import React, { forwardRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { SupplierStatement, SupplierProfile } from '@/types';

interface InvoiceDocumentProps {
  statement: SupplierStatement;
  supplier: SupplierProfile | null;
}

export const InvoiceDocument = forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  ({ statement, supplier }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

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
            <p className="text-gray-500 font-medium mt-1">#{statement.statementNo}</p>
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
            <p className="font-semibold text-gray-800">{formatDate(statement.periodStart)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Period End
            </p>
            <p className="font-semibold text-gray-800">{formatDate(statement.periodEnd)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Total Rides
            </p>
            <p className="font-semibold text-gray-800">{statement.totalRides != null ? statement.totalRides.toLocaleString() : 'N/A'}</p>
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
            <tr className="border-b border-gray-100">
              <td className="py-5 font-medium">Gross Ride Revenue</td>
              <td className="py-5 text-right font-medium">
                {statement.grossRevenue != null ? formatCurrency(statement.grossRevenue) : 'N/A'}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-5 font-medium">Platform Commission (Deduction)</td>
              <td className="py-5 text-right font-medium text-red-600">
                {statement.commissionEarned != null ? `-${formatCurrency(statement.commissionEarned)}` : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>{statement.grossRevenue != null && statement.commissionEarned != null ? formatCurrency(statement.grossRevenue - statement.commissionEarned) : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-4 mt-2 bg-gray-50 px-4 rounded-lg font-bold text-xl text-gray-900 border border-gray-200">
              <span>Net Balance</span>
              <span className="text-[#EAB308]">{formatCurrency(statement.netBalance)}</span>
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
