'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [customersRes, transactionsRes, inventoryRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/transactions'),
        fetch('/api/inventory'),
      ]);

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
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-8 py-6 flex items-center justify-between max-w-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Complete Mandi Khata Management System</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-10 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        {user && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-10 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
                <p className="text-green-50 text-sm">Here's your complete business overview</p>
              </div>
              <svg className="w-16 h-16 text-green-300 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
          </div>
        )}

        {/* Quick Links - Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/dashboard/user/customers">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-7 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Total Customers</p>
                  <h3 className="text-5xl font-bold mt-3">{stats.totalCustomers}</h3>
                  <p className="text-blue-100 text-xs mt-3">Click to manage all customers</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
                  <svg className="w-10 h-10 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/user/inventory">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-7 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-semibold uppercase tracking-wider">Inventory Items</p>
                  <h3 className="text-5xl font-bold mt-3">{stats.totalInventoryItems}</h3>
                  <p className="text-green-100 text-xs mt-3">Items in your stock</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
                  <svg className="w-10 h-10 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/user/reports">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-7 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider">Reports & Analytics</p>
                  <h3 className="text-5xl font-bold mt-3">View</h3>
                  <p className="text-purple-100 text-xs mt-3">Detailed business insights</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
                  <svg className="w-10 h-10 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Udhar (Given)</p>
            <h3 className="text-4xl font-bold text-red-600">₹{stats.totalUdhar.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-3">Inventory given to customers</p>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-1/3"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Jama (Received)</p>
            <h3 className="text-4xl font-bold text-green-600">₹{stats.totalJama.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-3">Payment received from customers</p>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-2/3"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
            <p className="text-sm font-medium text-gray-600 mb-2">Outstanding Amount</p>
            <h3 className="text-4xl font-bold text-orange-600">₹{stats.outstandingAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-3">Pending from customers</p>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-1/2"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
            <p className="text-sm font-medium text-gray-600 mb-2">Net Balance</p>
            <h3 className={`text-4xl font-bold ${stats.totalJama >= stats.totalUdhar ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(stats.totalJama - stats.totalUdhar).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-500 mt-3">Jama - Udhar</p>
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${stats.totalJama >= stats.totalUdhar ? 'bg-green-500' : 'bg-red-500'} w-3/4`}></div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockItems && stats.lowStockItems.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-10 shadow-sm">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 text-lg">Low Stock Alert</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  {stats.lowStockItems.length} item(s) are below reorder level. {' '}
                  <Link href="/dashboard/user/inventory" className="font-semibold hover:underline text-yellow-900">
                    View inventory
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
              <Link href="/dashboard/user/transactions" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all →
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{tx.particular}</p>
                        <p className="text-sm text-gray-500 mt-1">{tx.customerId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tx.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${tx.debit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.debit > 0 ? '−' : '+'} ₹{(tx.debit || tx.credit).toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                          tx.debit > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {tx.debit > 0 ? 'Udhar' : 'Jama'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Health */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Business Health</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                  <span className="text-sm font-bold text-green-600">
                    {stats.totalUdhar > 0 ? ((stats.totalJama / stats.totalUdhar) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(stats.totalUdhar > 0 ? (stats.totalJama / stats.totalUdhar) * 100 : 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Payment collected from total given</p>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Outstanding Ratio</span>
                  <span className="text-sm font-bold text-orange-600">
                    {stats.totalUdhar > 0 ? ((stats.outstandingAmount / stats.totalUdhar) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(stats.totalUdhar > 0 ? (stats.outstandingAmount / stats.totalUdhar) * 100 : 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Pending payment vs. total given</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link href="/dashboard/user/reports" className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 rounded-lg text-center hover:shadow-lg transition">
                  View Detailed Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
