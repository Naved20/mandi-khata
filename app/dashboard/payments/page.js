'use client';

import { useState } from 'react';
import { INR } from '@/utils/format';

function PaymentCard({ payment, index }) {
  const isIncoming = payment.type === 'payment_in';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isIncoming ? 'bg-green-100' : 'bg-red-100'}`}>
            <svg
              className={`w-5 h-5 ${isIncoming ? 'text-green-600' : 'text-red-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {isIncoming ? (
                <path d="M12 2a1 1 0 01.894.553l.894 1.789a1 1 0 001.293.372l1.788-.894a1 1 0 01.788 1.788l.894 1.894a1 1 0 01-1.293 1.293l-1.788-.894-1.789 1.894a1 1 0 11-1.414-1.414l1.894-1.789-1.894-1.789a1 1 0 01.372-1.293l1.789-.894z" />
              ) : (
                <path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              )}
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{payment.description}</p>
            <p className="text-xs text-gray-500">{payment.partyName}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isIncoming
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isIncoming ? 'Incoming' : 'Outgoing'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 py-3 border-t border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-600">Reference</p>
          <p className="font-semibold text-gray-900">#{payment.refNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Payment Mode</p>
          <p className="font-semibold text-gray-900 capitalize">{payment.mode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">Amount</p>
          <p className={`text-lg font-bold ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
            {isIncoming ? '+' : '-'}{INR(payment.amount)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          payment.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [filter, setFilter] = useState('all');

  // Demo payment data
  const payments = [
    {
      id: 1,
      type: 'payment_in',
      description: 'Customer Payment - Tomato Sale',
      partyName: 'Retail Shop A',
      amount: 45000,
      refNumber: 'TXN001',
      mode: 'cash',
      status: 'completed',
    },
    {
      id: 2,
      type: 'payment_out',
      description: 'Supplier Payment - Potato Batch',
      partyName: 'Farm Supplier B',
      amount: 32000,
      refNumber: 'TXN002',
      mode: 'bank',
      status: 'completed',
    },
    {
      id: 3,
      type: 'payment_in',
      description: 'Udhar Settlement - Previous Sale',
      partyName: 'Wholesale Buyer C',
      amount: 125000,
      refNumber: 'TXN003',
      mode: 'check',
      status: 'completed',
    },
    {
      id: 4,
      type: 'payment_out',
      description: 'Labor Charges - Weekly',
      partyName: 'Mandi Staff',
      amount: 8500,
      refNumber: 'TXN004',
      mode: 'cash',
      status: 'pending',
    },
    {
      id: 5,
      type: 'payment_in',
      description: 'Partial Payment - Wheat Lot',
      partyName: 'Grain Merchant D',
      amount: 75000,
      refNumber: 'TXN005',
      mode: 'bank',
      status: 'completed',
    },
  ];

  const filteredPayments = payments.filter(p => {
    if (filter === 'incoming') return p.type === 'payment_in';
    if (filter === 'outgoing') return p.type === 'payment_out';
    return true;
  });

  const totalIncoming = payments
    .filter(p => p.type === 'payment_in')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOutgoing = payments
    .filter(p => p.type === 'payment_out')
    .reduce((sum, p) => sum + p.amount, 0);
  const netCash = totalIncoming - totalOutgoing;

  return (
    <div className="  min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Payments & Receipts</h1>
          <p className="text-sm text-gray-600 mt-1">Manage incoming and outgoing payments</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Inflow</p>
            <p className="text-3xl font-bold text-green-600">{INR(totalIncoming)}</p>
            <p className="text-xs text-gray-500 mt-2">Money received</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Outflow</p>
            <p className="text-3xl font-bold text-red-600">{INR(totalOutgoing)}</p>
            <p className="text-xs text-gray-500 mt-2">Money paid out</p>
          </div>

          <div className={`rounded-xl border shadow-sm p-6 ${
            netCash >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-sm text-gray-600 mb-2">Net Cash Position</p>
            <p className={`text-3xl font-bold ${netCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {INR(netCash)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Current balance</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('incoming')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'incoming'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setFilter('outgoing')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'outgoing'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Outgoing
          </button>
        </div>

        {/* Payments List */}
        <div className="grid gap-4">
          {filteredPayments.map((payment, idx) => (
            <PaymentCard key={idx} payment={payment} index={idx} />
          ))}
        </div>
      </main>
    </div>
  );
}
