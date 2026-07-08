'use client';

import { useState } from 'react';
import { INR } from '@/utils/format';

function ProductRow({ product, index }) {
  const profitMargin = ((product.profit / product.revenue) * 100).toFixed(2);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <p className="font-semibold text-gray-900">{product.name}</p>
        <p className="text-xs text-gray-500">Bill #TXN{product.id}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">{product.quantity}</p>
        <p className="text-xs text-gray-500">{product.unit}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">{INR(product.costPrice)}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">{INR(product.sellingPrice)}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">{INR(product.revenue)}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">{INR(product.cost)}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className={`font-bold text-lg ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {INR(product.profit)}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className={`font-semibold ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {profitMargin}%
        </p>
      </td>
    </tr>
  );
}

export default function TradingPLPage() {
  const [timeframe, setTimeframe] = useState('today');

  // Demo P&L data
  const products = [
    {
      id: 1001,
      name: 'Tomato (Premium)',
      quantity: 250,
      unit: 'kg',
      costPrice: 25,
      sellingPrice: 40,
      revenue: 10000,
      cost: 6250,
      profit: 3750,
    },
    {
      id: 1002,
      name: 'Potato (Regular)',
      quantity: 500,
      unit: 'kg',
      costPrice: 20,
      sellingPrice: 32,
      revenue: 16000,
      cost: 10000,
      profit: 6000,
    },
    {
      id: 1003,
      name: 'Onion (Bulk)',
      quantity: 300,
      unit: 'kg',
      costPrice: 30,
      sellingPrice: 48,
      revenue: 14400,
      cost: 9000,
      profit: 5400,
    },
    {
      id: 1004,
      name: 'Wheat (Organic)',
      quantity: 50,
      unit: 'quintal',
      costPrice: 2200,
      sellingPrice: 2800,
      revenue: 140000,
      cost: 110000,
      profit: 30000,
    },
    {
      id: 1005,
      name: 'Chili (Dried)',
      quantity: 80,
      unit: 'kg',
      costPrice: 150,
      sellingPrice: 250,
      revenue: 20000,
      cost: 12000,
      profit: 8000,
    },
  ];

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = products.reduce((sum, p) => sum + p.cost, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(2);

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Trading P&L</h1>
          <p className="text-sm text-gray-600 mt-1">Profit and Loss analysis by product</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{INR(totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-2">{products.length} products</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Cost</p>
            <p className="text-3xl font-bold text-orange-600">{INR(totalCost)}</p>
            <p className="text-xs text-gray-500 mt-2">Cost of goods</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Gross Profit</p>
            <p className="text-3xl font-bold text-green-600">{INR(totalProfit)}</p>
            <p className="text-xs text-gray-500 mt-2">Before expenses</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
            <p className="text-3xl font-bold text-blue-600">{profitMargin}%</p>
            <p className="text-xs text-gray-500 mt-2">Profit margin</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          {['today', 'week', 'month', 'year'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded font-medium transition-colors capitalize ${
                timeframe === tf
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* P&L Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Product</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Qty</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Cost Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Selling Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Revenue</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Cost</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Profit</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Margin</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <ProductRow key={idx} product={product} index={idx} />
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="4" className="px-6 py-4 font-bold text-gray-900">Total</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{INR(totalRevenue)}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{INR(totalCost)}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">{INR(totalProfit)}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">{profitMargin}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Top Profit Products</h3>
            <div className="space-y-3">
              {products
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 3)
                .map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0">
                    <p className="text-gray-700">{idx + 1}. {p.name}</p>
                    <p className="font-bold text-green-600">{INR(p.profit)}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Highest Margin Products</h3>
            <div className="space-y-3">
              {products
                .sort((a, b) => ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100))
                .slice(0, 3)
                .map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0">
                    <p className="text-gray-700">{idx + 1}. {p.name}</p>
                    <p className="font-bold text-blue-600">{(((p.profit / p.revenue) * 100).toFixed(2))}%</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
