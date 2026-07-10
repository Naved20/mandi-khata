'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthHeaders } from '@/utils/api';

export default function UdhariManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, only_udhari, paid
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

  // Filter customers based on udhari status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.mobileNumber.includes(searchTerm);
    
    let matchesFilter = true;
    if (filterType === 'only_udhari') {
      matchesFilter = customer.currentBalance > 0; // Outstanding amount
    } else if (filterType === 'paid') {
      matchesFilter = customer.currentBalance <= 0; // No outstanding
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate totals
  const totalUdhari = customers.reduce((sum, c) => sum + c.totalUdhar, 0);
  const totalJama = customers.reduce((sum, c) => sum + c.totalJama, 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const customersWithUdhari = customers.filter(c => c.currentBalance > 0).length;

  if (loading) {
    return (
      <div className=" min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading udhari data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Udhari Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage credit transactions</p>
        </div>
      </header>

      {/* Main Content */}
      <main className=" px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Udhar Given</p>
            <h3 className="text-3xl font-bold text-red-600">₹{totalUdhari.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Total inventory distributed</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Jama Collected</p>
            <h3 className="text-3xl font-bold text-green-600">₹{totalJama.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Total payments received</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Outstanding Amount</p>
            <h3 className="text-3xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Pending to collect</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Customers with Udhari</p>
            <h3 className="text-3xl font-bold text-blue-600">{customersWithUdhari}</h3>
            <p className="text-xs text-gray-500 mt-2">Out of {customers.length} total</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Customers</option>
              <option value="only_udhari">Only with Outstanding</option>
              <option value="paid">Fully Paid</option>
            </select>
          </div>
        </div>

        {/* Udhari Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Udhar</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Jama</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Outstanding</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.mobileNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                        ₹{customer.totalUdhar.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                        ₹{customer.totalJama.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold">
                        <span className={customer.currentBalance > 0 ? 'text-orange-600' : 'text-green-600'}>
                          ₹{customer.currentBalance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.currentBalance > 0
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {customer.currentBalance > 0 ? 'Outstanding' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/dashboard/user/customers/${customer._id}`}>
                          <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">How to Manage Udhari:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-3">
              <span className="font-bold">1.</span>
              <span>Click &quot;View&quot; to open customer profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold">2.</span>
              <span>Click &quot;Add Transaction&quot; to record inventory given (Udhar)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold">3.</span>
              <span>Select transaction type: &quot;Inventory Udhar&quot; for giving inventory on credit</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold">4.</span>
              <span>When customer pays, add &quot;Cash Jama&quot; transaction to record payment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold">5.</span>
              <span>Outstanding amount automatically updates after each transaction</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
