'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthHeaders } from '@/utils/api';

export default function UserDashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalUdhar: 0,
    totalJama: 0,
    outstandingAmount: 0,
    totalInventoryItems: 0,
    recentTransactions: [],
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [customersRes, transactionsRes, inventoryRes] = await Promise.all([
        fetch('/api/customers', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/transactions', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/inventory', {
          headers: getAuthHeaders(),
        }),
      ]);

      if (customersRes.status === 401 || transactionsRes.status === 401 || inventoryRes.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const customersData = await customersRes.json();
      const transactionsData = await transactionsRes.json();
      const inventoryData = await inventoryRes.json();

      const customers = customersData.customers || [];
      const transactions = transactionsData.transactions || [];
      const inventory = inventoryData.inventory || [];

      const totalUdhar = customers.reduce((sum, c) => sum + c.totalUdhar, 0);
      const totalJama = customers.reduce((sum, c) => sum + c.totalJama, 0);
      const outstanding = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
      const lowStockItems = inventory.filter(i => i.currentStock < i.reorderLevel && i.reorderLevel > 0);

      setStats({
        totalCustomers: customers.length,
        totalUdhar,
        totalJama,
        outstandingAmount: outstanding,
        totalInventoryItems: inventory.length,
        recentTransactions: transactions.slice(0, 5),
        lowStockItems,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 sm:h-10 w-8 sm:w-10 border-b-2 border-green-600"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile responsive */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">Digital Ledger & Inventory System</p>
            </div>
            {user && (
              <div className="hidden sm:block bg-gray-100 px-3 py-1 rounded-full">
                <p className="text-xs text-gray-700 font-medium">{user.name || user.email}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Banner for mobile */}
        {user && (
          <div className="sm:hidden bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium">Hello, {user.name?.split(' ')[0] || user.email.split('@')[0]}</p>
                <p className="text-sm font-bold">Welcome back</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links - Mobile responsive cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Link href="/dashboard/user/customers">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-100">Customers</p>
                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{stats.totalCustomers}</h3>
                </div>
                <svg className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/user/inventory">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-100">Inventory</p>
                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{stats.totalInventoryItems}</h3>
                </div>
                <svg className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/user/reports" className="col-span-2 sm:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-white shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-100">Reports</p>
                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">View</h3>
                </div>
                <svg className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Key Statistics - Mobile responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Udhar</p>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">₹{stats.totalUdhar.toLocaleString('en-IN')}</h3>
            <p className="hidden sm:block text-xs text-gray-500 mt-1 sm:mt-2">Given to customers</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Jama</p>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">₹{stats.totalJama.toLocaleString('en-IN')}</h3>
            <p className="hidden sm:block text-xs text-gray-500 mt-1 sm:mt-2">Received from customers</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Pending</p>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-600">₹{stats.outstandingAmount.toLocaleString('en-IN')}</h3>
            <p className="hidden sm:block text-xs text-gray-500 mt-1 sm:mt-2">Outstanding</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Balance</p>
            <h3 className={`text-lg sm:text-2xl lg:text-3xl font-bold ${stats.totalJama >= stats.totalUdhar ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(stats.totalJama - stats.totalUdhar).toLocaleString('en-IN')}
            </h3>
            <p className="hidden sm:block text-xs text-gray-500 mt-1 sm:mt-2">Jama - Udhar</p>
          </div>
        </div>

        {/* Low Stock Alert - Mobile responsive */}
        {stats.lowStockItems && stats.lowStockItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900 text-sm sm:text-base">Low Stock Alert</h3>
                <p className="text-xs sm:text-sm text-yellow-800 mt-0.5 sm:mt-1">
                  {stats.lowStockItems.length} item(s) low. {' '}
                  <Link href="/dashboard/user/inventory" className="font-semibold hover:underline text-xs sm:text-sm">
                    View inventory
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid - Mobile first, desktop columns */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-1 xl:grid-cols-2 lg:gap-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Transactions</h2>
                <Link href="/dashboard/user/transactions" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium">
                  View all →
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="p-3 sm:p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{tx.particular}</p>
                        <p className="text-xs text-gray-500 truncate">{tx.customerId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                          {new Date(tx.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                        <p className={`font-semibold text-sm sm:text-base ${tx.debit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.debit > 0 ? '-' : '+'} ₹{(tx.debit || tx.credit).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.debit > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {tx.debit > 0 ? 'Udhar' : 'Jama'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  No transactions yet
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stacked on mobile, grid on desktop */}
          <div className="space-y-4 sm:space-y-6">
            {/* Business Health - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">Business Health</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between mb-1 sm:mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Collection Rate</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {stats.totalUdhar > 0 ? ((stats.totalJama / stats.totalUdhar) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-green-600 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${Math.min(stats.totalUdhar > 0 ? (stats.totalJama / stats.totalUdhar) * 100 : 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 sm:mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Outstanding Ratio</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {stats.totalUdhar > 0 ? ((stats.outstandingAmount / stats.totalUdhar) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-orange-600 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${Math.min(stats.totalUdhar > 0 ? (stats.outstandingAmount / stats.totalUdhar) * 100 : 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Mobile compact */}
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-2 lg:gap-3">
                <Link href="/dashboard/user/customers" className="p-2 sm:p-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-xs sm:text-sm">
                  Add Customer
                </Link>
                <Link href="/dashboard/user/inventory" className="p-2 sm:p-3 text-left bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium text-xs sm:text-sm">
                  Add Inventory
                </Link>
                <Link href="/dashboard/user/reports" className="p-2 sm:p-3 text-left bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-medium text-xs sm:text-sm col-span-2 sm:col-span-1">
                  Generate Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
