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
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
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
      const customersRes = await fetch('/api/customers');
      const customersData = await customersRes.json();
      const customers = customersData.customers || [];

      const transactionsRes = await fetch('/api/transactions');
      const transactionsData = await transactionsRes.json();
      const transactions = transactionsData.transactions || [];

      const totalUdhar = customers.reduce((sum, c) => sum + c.totalUdhar, 0);
      const totalJama = customers.reduce((sum, c) => sum + c.totalJama, 0);
      const outstanding = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);

      setStats({
        totalCustomers: customers.length,
        totalUdhar,
        totalJama,
        outstandingAmount: outstanding,
      });

      setRecentTransactions(transactions.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Mandi Khata Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Digital Ledger & Inventory System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/user/customers">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl font-bold mb-2">{stats.totalCustomers}</div>
              <p className="text-blue-100">Total Customers</p>
            </div>
          </Link>

          <Link href="/dashboard/user/inventory">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl font-bold mb-2">Stock</div>
              <p className="text-green-100">Manage Inventory</p>
            </div>
          </Link>

          <Link href="/dashboard/user/reports">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl font-bold mb-2">Reports</div>
              <p className="text-purple-100">View Analytics</p>
            </div>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Udhar</p>
            <h3 className="text-3xl font-bold text-red-600">₹{stats.totalUdhar.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Total debits</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Jama</p>
            <h3 className="text-3xl font-bold text-green-600">₹{stats.totalJama.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Total credits</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Outstanding</p>
            <h3 className="text-3xl font-bold text-orange-600">₹{stats.outstandingAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">To be collected</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Net Balance</p>
            <h3 className="text-3xl font-bold text-blue-600">₹{(stats.totalJama - stats.totalUdhar).toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Overall balance</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link href="/dashboard/user/transactions" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{tx.particular}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    {tx.debit > 0 ? (
                      <p className="font-semibold text-red-600">₹{tx.debit.toLocaleString('en-IN')}</p>
                    ) : (
                      <p className="font-semibold text-green-600">₹{tx.credit.toLocaleString('en-IN')}</p>
                    )}
                    <p className={`text-xs font-medium ${tx.debit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.debit > 0 ? 'Udhar' : 'Jama'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
