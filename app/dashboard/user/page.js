'use client';

import { useState, useEffect } from 'react';
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm  ">
        <div className="px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Digital Ledger & Inventory System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="  px-8 py-8">
        {/* Welcome Banner */}
        {user && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Welcome back, {user.name}!</h2>
            <p className="text-sm text-gray-600 mt-1">Here&apos;s your business overview for today</p>
          </div>
        )}

        {/* Quick Links - Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/user/customers">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.totalCustomers}</h3>
                </div>
                <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/user/inventory">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Inventory Items</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.totalInventoryItems}</h3>
                </div>
                <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/user/reports">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">View Reports</p>
                  <h3 className="text-4xl font-bold mt-2">Reports</h3>
                </div>
                <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Udhar (Given)</p>
            <h3 className="text-3xl font-bold text-red-600">₹{stats.totalUdhar.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Total inventory given to customers</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Jama (Received)</p>
            <h3 className="text-3xl font-bold text-green-600">₹{stats.totalJama.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Total payment received from customers</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Outstanding Amount</p>
            <h3 className="text-3xl font-bold text-orange-600">₹{stats.outstandingAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Pending from customers</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Net Balance</p>
            <h3 className={`text-3xl font-bold ${stats.totalJama >= stats.totalUdhar ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(stats.totalJama - stats.totalUdhar).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-500 mt-2">Jama - Udhar</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockItems && stats.lowStockItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  {stats.lowStockItems.length} item(s) are below reorder level. {' '}
                  <Link href="/dashboard/user/inventory" className="font-semibold hover:underline">
                    View inventory
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                <Link href="/dashboard/user/transactions" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  View all
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tx.particular}</p>
                        <p className="text-sm text-gray-500">{tx.customerId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tx.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.debit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.debit > 0 ? '-' : '+'} ₹{(tx.debit || tx.credit).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
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
                <div className="text-center py-8 text-gray-500">
                  No transactions yet
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Business Health */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Business Health</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Collection Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totalUdhar > 0 ? ((stats.totalJama / stats.totalUdhar) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(stats.totalUdhar > 0 ? (stats.totalJama / stats.totalUdhar) * 100 : 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Outstanding Ratio</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totalUdhar > 0 ? ((stats.outstandingAmount / stats.totalUdhar) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${Math.min(stats.totalUdhar > 0 ? (stats.outstandingAmount / stats.totalUdhar) * 100 : 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                <Link href="/dashboard/user/customers" className="block w-full p-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm">
                  Add New Customer
                </Link>
                <Link href="/dashboard/user/inventory" className="block w-full p-3 text-left bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium text-sm">
                  Add Inventory Item
                </Link>
                <Link href="/dashboard/user/reports" className="block w-full p-3 text-left bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-medium text-sm">
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
