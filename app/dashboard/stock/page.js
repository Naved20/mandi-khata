'use client';

import { useState } from 'react';
import { INR } from '@/utils/format';

function StockItem({ item, index }) {
  const lowStockThreshold = 100;
  const isLowStock = item.quantity < lowStockThreshold;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-gray-900">{item.product}</p>
          <p className="text-xs text-gray-500">Category: {item.category}</p>
        </div>
        {isLowStock && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
            Low Stock
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-600">Current Stock</p>
          <p className="text-lg font-semibold text-gray-900">{item.quantity}</p>
          <p className="text-xs text-gray-500">{item.unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Cost Price</p>
          <p className="text-lg font-semibold text-gray-900">{INR(item.costPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Selling Price</p>
          <p className="text-lg font-semibold text-green-600">{INR(item.sellingPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Stock Value</p>
          <p className="text-lg font-semibold text-blue-600">{INR(item.quantity * item.costPrice)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-colors ${
              isLowStock ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((item.quantity / (lowStockThreshold * 2)) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {isLowStock ? `Warning: Only ${item.quantity} units left` : `Stock level: ${item.quantity} units`}
        </p>
      </div>
    </div>
  );
}

export default function StockStatusPage() {
  const [filter, setFilter] = useState('all');

  // Demo stock data
  const stockItems = [
    {
      id: 1,
      product: 'Tomato',
      category: 'Vegetables',
      quantity: 450,
      unit: 'kg',
      costPrice: 25,
      sellingPrice: 35,
    },
    {
      id: 2,
      product: 'Potato',
      category: 'Vegetables',
      quantity: 85,
      unit: 'kg',
      costPrice: 20,
      sellingPrice: 30,
    },
    {
      id: 3,
      product: 'Onion',
      category: 'Vegetables',
      quantity: 320,
      unit: 'kg',
      costPrice: 30,
      sellingPrice: 45,
    },
    {
      id: 4,
      product: 'Wheat',
      category: 'Grains',
      quantity: 2500,
      unit: 'quintal',
      costPrice: 2200,
      sellingPrice: 2500,
    },
    {
      id: 5,
      product: 'Rice',
      category: 'Grains',
      quantity: 1200,
      unit: 'quintal',
      costPrice: 4500,
      sellingPrice: 5200,
    },
    {
      id: 6,
      product: 'Chili',
      category: 'Spices',
      quantity: 45,
      unit: 'kg',
      costPrice: 150,
      sellingPrice: 200,
    },
  ];

  const filteredItems = stockItems.filter(item => {
    if (filter === 'low') return item.quantity < 100;
    if (filter === 'high') return item.quantity >= 100;
    return true;
  });

  const totalValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const lowStockCount = stockItems.filter(item => item.quantity < 100).length;

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Stock Status</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time inventory management and stock tracking</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Stock Value</p>
            <p className="text-3xl font-bold text-gray-900">{INR(totalValue)}</p>
            <p className="text-xs text-gray-500 mt-2">{stockItems.length} products</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Products Available</p>
            <p className="text-3xl font-bold text-green-600">{stockItems.length}</p>
            <p className="text-xs text-gray-500 mt-2">In warehouse</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Low Stock Alert</p>
            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
            <p className="text-xs text-gray-500 mt-2">Need reordering</p>
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
            All Items
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'high'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Good Stock
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === 'low'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Low Stock
          </button>
        </div>

        {/* Stock Items Grid */}
        <div className="grid gap-4">
          {filteredItems.map((item, idx) => (
            <StockItem key={idx} item={item} index={idx} />
          ))}
        </div>
      </main>
    </div>
  );
}
