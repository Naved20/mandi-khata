'use client';

import { useState } from 'react';
import { INR } from '@/utils/format';

function FarmerCard({ farmer, index }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{farmer.name}</p>
          <p className="text-xs text-gray-500">Farmer ID: {farmer.id}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100 mb-3">
        <div>
          <p className="text-xs text-gray-600">Phone</p>
          <p className="font-semibold text-gray-900">{farmer.phone}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Opening Balance</p>
          <p className="font-semibold text-gray-900">{INR(farmer.balance)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600">Address: {farmer.address}</p>
    </div>
  );
}

export default function MasterDataPage() {
  const [tab, setTab] = useState('farmers');
  const [showForm, setShowForm] = useState(false);

  // Demo data
  const farmers = [
    {
      id: 'F001',
      name: 'Raj Kumar Singh',
      phone: '9876543210',
      address: 'Village Nakoda, District Indore',
      balance: 5000,
    },
    {
      id: 'F002',
      name: 'Prem Prakash',
      phone: '9876543211',
      address: 'Village Pithapur, District Madhya Pradesh',
      balance: -12000,
    },
    {
      id: 'F003',
      name: 'Suresh Yadav',
      phone: '9876543212',
      address: 'Village Rajpur, District Indore',
      balance: 8500,
    },
  ];

  const products = [
    { id: 'P001', name: 'Tomato', category: 'Vegetables', unit: 'kg' },
    { id: 'P002', name: 'Potato', category: 'Vegetables', unit: 'kg' },
    { id: 'P003', name: 'Onion', category: 'Vegetables', unit: 'kg' },
    { id: 'P004', name: 'Wheat', category: 'Grains', unit: 'quintal' },
    { id: 'P005', name: 'Rice', category: 'Grains', unit: 'quintal' },
    { id: 'P006', name: 'Chili', category: 'Spices', unit: 'kg' },
  ];

  const categories = [
    { id: 'C001', name: 'Vegetables' },
    { id: 'C002', name: 'Grains' },
    { id: 'C003', name: 'Spices' },
    { id: 'C004', name: 'Fruits' },
  ];

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
            <p className="text-sm text-gray-600 mt-1">Manage farmers, products, and categories</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Close' : 'Add New'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Entry</h2>
            <form className="space-y-4">
              {tab === 'farmers' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Farmer Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  ></textarea>
                  <input
                    type="number"
                    placeholder="Opening Balance"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
              {tab === 'products' && (
                <>
                  <input
                    type="text"
                    placeholder="Product Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Category"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Unit (kg, quintal, etc)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          {['farmers', 'products', 'categories'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Farmers Tab */}
        {tab === 'farmers' && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-2">Total Farmers</p>
                <p className="text-3xl font-bold text-gray-900">{farmers.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-2">Active Farmers</p>
                <p className="text-3xl font-bold text-green-600">
                  {farmers.filter(f => f.balance >= 0).length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-2">Total Outstanding</p>
                <p className="text-3xl font-bold text-red-600">
                  {INR(farmers.reduce((sum, f) => sum + Math.min(f.balance, 0), 0))}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {farmers.map((farmer, idx) => (
                <FarmerCard key={idx} farmer={farmer} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{product.id}</td>
                    <td className="px-6 py-4 text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-gray-600">{product.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <p className="text-xs text-gray-500 mb-2">Category ID: {category.id}</p>
                <p className="font-bold text-gray-900 text-lg">{category.name}</p>
                <button className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
