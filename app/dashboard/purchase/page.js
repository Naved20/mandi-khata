'use client';

import { useState, useEffect } from 'react';
import { INR } from '@/utils/format';

function PurchaseCard({ purchase, index }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Bill #{purchase.billNumber}</p>
          <p className="text-sm text-gray-600">{purchase.productName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          purchase.mode === 'cash' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {purchase.mode === 'cash' ? 'Cash' : 'Udhar'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 py-3 border-t border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-600">Quantity</p>
          <p className="font-semibold text-gray-900">{purchase.quantity} units</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Rate</p>
          <p className="font-semibold text-gray-900">{INR(purchase.rate)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">Net Payable</p>
          <p className="text-lg font-bold text-gray-900">{INR(purchase.netPayable)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          purchase.status === 'paid'
            ? 'bg-green-100 text-green-800'
            : purchase.status === 'partial'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions?type=purchase&limit=20');
        const data = await response.json();
        setPurchases(data.transactions || []);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'cash') return p.mode === 'cash';
    if (filter === 'udhar') return p.mode === 'udhar';
    return true;
  });

  const totalPurchases = purchases.reduce((sum, p) => sum + p.netPayable, 0);
  const udharAmount = purchases
    .filter(p => p.mode === 'udhar')
    .reduce((sum, p) => sum + p.netPayable, 0);
  const cashAmount = purchases
    .filter(p => p.mode === 'cash')
    .reduce((sum, p) => sum + p.netPayable, 0);

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track all incoming supplies and purchases</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Purchases</p>
            <p className="text-3xl font-bold text-gray-900">{INR(totalPurchases)}</p>
            <p className="text-xs text-gray-500 mt-2">{purchases.length} transactions</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Cash Purchases</p>
            <p className="text-3xl font-bold text-green-600">{INR(cashAmount)}</p>
            <p className="text-xs text-gray-500 mt-2">Immediate payment</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Udhar (Credit) Purchases</p>
            <p className="text-3xl font-bold text-orange-600">{INR(udharAmount)}</p>
            <p className="text-xs text-gray-500 mt-2">Pending payment</p>
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
            onClick={() => setFilter('cash')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'cash'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setFilter('udhar')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'udhar'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Udhar (Credit)
          </button>
        </div>

        {/* Purchases List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-12 h-12">
              <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        ) : filteredPurchases.length > 0 ? (
          <div className="grid gap-4">
            {filteredPurchases.map((purchase, idx) => (
              <PurchaseCard key={idx} purchase={purchase} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">No purchases found</p>
          </div>
        )}
      </main>
    </div>
  );
}
