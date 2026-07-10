'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getAuthHeaders } from '@/utils/api';

export default function InventoryDetailPage() {
  const params = useParams();
  const inventoryId = params.id;
  const [item, setItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/${inventoryId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      setItem(data.item);
      setPriceHistory(data.priceHistory || []);

      // Fetch all transactions and filter for this item
      const transRes = await fetch('/api/transactions', {
        headers: getAuthHeaders(),
      });
      
      if (transRes.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const transData = await transRes.json();
      const itemTransactions = (transData.transactions || [])
        .filter(t => t.inventoryItemId && t.inventoryItemId._id === inventoryId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(itemTransactions);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, [inventoryId]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading inventory details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{item.itemName}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Price</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              ₹{(item.price || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Item Information */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Item Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Item Name</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{item.itemName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Price</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">₹{(item.price || 0).toLocaleString('en-IN')}</p>
            </div>
            {item.notes && (
              <div className="md:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600">Notes</p>
                <p className="text-gray-900 text-sm">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Transaction History</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{transactions.length} transactions recorded</p>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                        {new Date(tx.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                        {tx.customerId?.name || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-semibold">
                        {tx.quantity ? `${tx.quantity} kg` : '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-semibold text-green-600">
                        ₹{(tx.debit || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No transactions recorded for this item
            </div>
          )}
        </div>

        {/* Price History */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Price History</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{priceHistory.length} price changes recorded</p>
          </div>

          {priceHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Old Price</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">New Price</th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Change Type</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {priceHistory.map((history) => (
                    <tr key={history._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                        {new Date(history.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-red-600 font-semibold">
                        {history.changeType === 'created' ? '-' : `₹${(history.oldPrice || 0).toLocaleString('en-IN')}`}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-green-600 font-semibold">
                        ₹{(history.newPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          history.changeType === 'created' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {history.changeType}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                        {history.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No price changes recorded for this item
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
