'use client';

import { useState, useEffect } from 'react';
import { exportToCSV, printContent } from '@/utils/exportUtils';
import { getAuthHeaders } from '@/utils/api';

const transactionTypeLabels = {
  udhar: 'Udhar',
  jama: 'Jama',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [txRes, custRes] = await Promise.all([
          fetch('/api/transactions', { headers: getAuthHeaders() }),
          fetch('/api/customers', { headers: getAuthHeaders() }),
        ]);

        if (txRes.status === 401 || custRes.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }

        if (custRes.ok) {
          const custData = await custRes.json();
          setCustomers(custData.customers || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.particular || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || t.transactionType === filterType;
    const matchesCustomer = filterCustomer === 'all' || t.customerId?._id === filterCustomer || t.customerId === filterCustomer;
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const txDate = new Date(t.date);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && txDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && txDate <= end;
      }
    }

    return matchesSearch && matchesType && matchesCustomer && matchesDateRange;
  });

  const totalDebit = filteredTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = filteredTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  const netBalance = totalDebit - totalCredit;

  const handleExportCSV = () => {
    const dataToExport = filteredTransactions.map(tx => ({
      'Date': new Date(tx.date).toLocaleDateString('en-IN'),
      'Customer': typeof tx.customerId === 'string' ? 'Unknown' : (tx.customerId?.name || 'Unknown'),
      'Particular': tx.particular || '-',
      'Type': transactionTypeLabels[tx.transactionType] || tx.transactionType,
      'Debit (₹)': tx.debit || 0,
      'Credit (₹)': tx.credit || 0,
    }));

    exportToCSV(dataToExport, 'transactions_report');
  };

  const handlePrint = () => {
    printContent('transactions-table', 'Transactions Report');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage all ledger transactions</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Debit (Udhar)</p>
            <h3 className="text-3xl font-bold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">{filteredTransactions.filter(t => t.debit > 0).length} entries</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Credit (Jama)</p>
            <h3 className="text-3xl font-bold text-green-600">₹{totalCredit.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">{filteredTransactions.filter(t => t.credit > 0).length} entries</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Net Balance</p>
            <h3 className={`text-3xl font-bold ${netBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{netBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-500 mt-2">{netBalance > 0 ? 'You owe' : 'You are owed'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by particular or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              {Object.entries(transactionTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Customers</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {(searchTerm || filterType !== 'all' || filterCustomer !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCustomer('all');
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100"
              >
                Print
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" id="transactions-table">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Particular</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Debit (₹)</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id || transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {typeof transaction.customerId === 'string' ? 'Unknown' : (transaction.customerId?.name || 'Unknown')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.particular || transaction.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {transactionTypeLabels[transaction.transactionType] || transaction.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                        ₹{(transaction.debit || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                        ₹{(transaction.credit || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Debit</p>
                <p className="text-2xl font-bold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Credit</p>
                <p className="text-2xl font-bold text-green-600">₹{totalCredit.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
