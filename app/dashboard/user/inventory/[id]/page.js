'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

export default function InventoryDetailPage() {
  const params = useParams();
  const inventoryId = params.id;
  const [item, setItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/${inventoryId}`);
      const data = await response.json();
      setItem(data.item);

      // Fetch all transactions and filter for this item
      const transRes = await fetch('/api/transactions');
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

  const totalQuantitySold = transactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + t.debit, 0);
  const averagePrice = transactions.length > 0 ? totalRevenue / totalQuantitySold : 0;
  const profit = item.sellingPrice - item.buyingPrice;
  const profitMargin = item.buyingPrice > 0 ? ((profit / item.buyingPrice) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40  ">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.itemName}</h1>
            <p className="text-sm text-gray-600 mt-1">{item.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
            <p className="text-3xl font-bold text-green-600">
              {item.currentStock} <span className="text-lg text-gray-600">{item.unit}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Current Stock</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {item.currentStock}
              <span className="text-sm text-gray-500 ml-2">{item.unit}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              Reorder Level: {item.reorderLevel} {item.unit}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Buying Price</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{item.buyingPrice.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Per {item.unit}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Selling Price</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{item.sellingPrice.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Per {item.unit}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Profit Margin</p>
            <h3 className="text-3xl font-bold text-green-600">{profitMargin}%</h3>
            <p className="text-xs text-gray-500 mt-2">
              ₹{profit.toLocaleString('en-IN')} per {item.unit}
            </p>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Quantity Sold</p>
            <h3 className="text-3xl font-bold text-blue-600">
              {totalQuantitySold} <span className="text-sm text-gray-500">{item.unit}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-2">{transactions.length} transactions</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
            <h3 className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">From all sales</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Average Sale Price</p>
            <h3 className="text-3xl font-bold text-orange-600">₹{averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-500 mt-2">Per {item.unit}</p>
          </div>
        </div>

        {/* Item Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Item Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Item Name</p>
              <p className="text-lg font-semibold text-gray-900">{item.itemName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold text-gray-900">{item.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unit</p>
              <p className="text-lg font-semibold text-gray-900">{item.unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reorder Level</p>
              <p className="text-lg font-semibold text-gray-900">{item.reorderLevel} {item.unit}</p>
            </div>
            {item.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-600 mt-1">{transactions.length} transactions recorded</p>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Quantity Sold</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx, idx) => {
                    const quantitySold = tx.quantity || 0;
                    const unitPrice = quantitySold > 0 ? tx.debit / quantitySold : 0;
                    const profitPerUnit = item.sellingPrice - item.buyingPrice;
                    const totalProfit = (profitPerUnit * quantitySold).toFixed(0);

                    return (
                      <tr key={tx._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(tx.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tx.customerId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold">
                          {quantitySold} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          ₹{unitPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                          ₹{tx.debit.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          ₹{totalProfit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No transaction history for this item
            </div>
          )}
        </div>

        {/* Stock Movement Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Stock Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Initial Purchase Potential</p>
                <p className="text-sm text-gray-500">
                  Total stock received or available
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {(item.currentStock + totalQuantitySold)} {item.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Quantity Sold</p>
                <p className="text-sm text-gray-500">
                  Total quantity distributed to customers
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {totalQuantitySold} {item.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-sm text-gray-500">
                  Remaining quantity available
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {item.currentStock} {item.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Level Warning */}
          {item.currentStock < item.reorderLevel && item.reorderLevel > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800">
                Stock Warning: Current stock is below reorder level!
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Current: {item.currentStock} {item.unit} | Reorder Level: {item.reorderLevel} {item.unit}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
