'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthHeaders } from '@/utils/api';

export default function UdhariManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers', {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.mobileNumber.includes(searchTerm);
    
    let matchesFilter = true;
    if (filterType === 'only_udhari') {
      matchesFilter = customer.currentBalance > 0;
    } else if (filterType === 'paid') {
      matchesFilter = customer.currentBalance <= 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  const totalUdhari = customers.reduce((sum, c) => sum + (c.totalUdhar || 0), 0);
  const totalJama = customers.reduce((sum, c) => sum + (c.totalJama || 0), 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance || 0), 0);
  const customersWithUdhari = customers.filter(c => c.currentBalance > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Udhari</h1>
          <p className="text-xs text-gray-500 mt-1">Track credit & payments</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-20">
        {/* Summary Cards - Compact Mobile Layout */}
        <div className="space-y-3 mb-6">
          {/* Card 1: Total Outstanding (Highlighted) */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-orange-700 font-medium">Pending Amount</p>
                <h2 className="text-2xl font-bold text-orange-600 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</h2>
                <p className="text-xs text-orange-600 mt-2">{customersWithUdhari} customers with balance</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          {/* Cards 2-4: Other metrics in row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 rounded-lg border border-red-200 p-3">
              <p className="text-xs text-red-700 font-medium">Total Udhar</p>
              <p className="text-lg font-bold text-red-600 mt-1">₹{(totalUdhari / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-3">
              <p className="text-xs text-green-700 font-medium">Total Jama</p>
              <p className="text-lg font-bold text-green-600 mt-1">₹{(totalJama / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
              <p className="text-xs text-blue-700 font-medium">Total Customers</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{customers.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="sticky top-20 z-30 bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200 space-y-2 mb-4">
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Customers</option>
            <option value="only_udhari">With Outstanding</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>

        {/* Customer Cards List - No horizontal scroll */}
        <div className="space-y-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div 
                key={customer._id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Header: Name and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{customer.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{customer.mobileNumber}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    customer.currentBalance > 0
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {customer.currentBalance > 0 ? 'Pending' : 'Paid'}
                  </span>
                </div>

                {/* Main Amount - Large and Clear */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-600 font-medium">Outstanding Balance</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    customer.currentBalance > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    ₹{(customer.currentBalance || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Details Grid - Compact */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-xs text-red-700 font-medium">Udhar Given</p>
                    <p className="text-sm font-bold text-red-600 mt-0.5">₹{(customer.totalUdhar || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-700 font-medium">Jama Collected</p>
                    <p className="text-sm font-bold text-green-600 mt-0.5">₹{(customer.totalJama || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/dashboard/user/customers/${customer._id}`} className="block w-full">
                  <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 rounded-lg text-sm transition-colors">
                    View Details →
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No customers found</p>
            </div>
          )}
        </div>

        {/* Help Section */}
        {filteredCustomers.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-bold text-blue-900 text-sm mb-2">💡 Tip</h3>
            <p className="text-xs text-blue-800">Tap "View Details" to add transactions, record payments, or view complete history for any customer.</p>
          </div>
        )}
      </main>
    </div>
  );
}
