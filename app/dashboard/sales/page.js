'use client';

import { useState, useEffect } from 'react';
import { INR } from '@/utils/format';

function SaleCard({ sale, index }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Bill #{sale.billNumber}</p>
          <p className="text-sm text-gray-600">{sale.productName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          sale.mode === 'cash' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {sale.mode === 'cash' ? 'Cash' : 'Udhar'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 py-3 border-t border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-600">Quantity</p>
          <p className="font-semibold text-gray-900">{sale.quantity} units</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Rate</p>
          <p className="font-semibold text-gray-900">{INR(sale.rate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-600">Commission</p>
          <p className="font-semibold text-gray-900">{sale.commission}%</p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-600">Tax</p>
          <p className="font-semibold text-gray-900">{sale.tax}%</p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-600">Labor</p>
          <p className="font-semibold text-gray-900">{INR(sale.laborCharge)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-600">Net Receivable</p>
          <p className="text-lg font-bold text-green-600">{INR(sale.netPayable)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          sale.status === 'paid'
            ? 'bg-green-100 text-green-800'
            : sale.status === 'partial'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions?type=sale&limit=20');
        const data = await response.json();
        setSales(data.transactions || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const filteredSales = sales.filter(s => {
    if (filter === 'cash') return s.mode === 'cash';
    if (filter === 'udhar') return s.mode === 'udhar';
    return true;
  });

  const totalSales = sales.reduce((sum, s) => sum + s.netPayable, 0);
  const udharAmount = sales
    .filter(s => s.mode === 'udhar')
    .reduce((sum, s) => sum + s.netPayable, 0);
  const cashAmount = sales
    .filter(s => s.mode === 'cash')
    .reduce((sum, s) => sum + s.netPayable, 0);

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Sales & Billing</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor all sales transactions and generate bills</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900">{INR(totalSales)}</p>
            <p className="text-xs text-gray-500 mt-2">{sales.length} transactions</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Cash Sales (Collected)</p>
            <p className="text-3xl font-bold text-green-600">{INR(cashAmount)}</p>
            <p className="text-xs text-gray-500 mt-2">Immediate collection</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Udhar Sales (Outstanding)</p>
            <p className="text-3xl font-bold text-orange-600">{INR(udharAmount)}</p>
            <p className="text-xs text-gray-500 mt-2">Pending collection</p>
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

        {/* Sales List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-12 h-12">
              <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        ) : filteredSales.length > 0 ? (
          <div className="grid gap-4">
            {filteredSales.map((sale, idx) => (
              <SaleCard key={idx} sale={sale} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">No sales found</p>
          </div>
        )}
      </main>
    </div>
  );
}
