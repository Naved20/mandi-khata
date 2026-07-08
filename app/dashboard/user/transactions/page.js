'use client';

import { useState, useEffect } from 'react';
import { exportToCSV, printContent } from '@/utils/exportUtils';

const transactionTypeLabels = {
  udhar_inventory: 'Udhar - Inventory',
  udhar_cash: 'Udhar - Cash',
  jama_cash: 'Jama - Cash',
  jama_upi: 'Jama - UPI',
  jama_bank: 'Jama - Bank',
  jama_cheque: 'Jama - Cheque',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchCustomers();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.particular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || t.transactionType === filterType;
    
    const matchesCustomer = filterCustomer === 'all' || t.customerId?._id === filterCustomer;
    
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
      'Customer': tx.customerId?.name || 'Unknown',
      'Particular': tx.particular,
      'Type': transactionTypeLabels[tx.transactionType] || tx.transactionType,
      'Debit (₹)': tx.debit || '-',
      'Credit (₹)': tx.credit || '-',
      'Running Balance (₹)': tx.runningBalance,
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40  ">
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
              placeholder="Start Date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
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
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm2-6a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
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
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Debit</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Credit</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {transaction.customerId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.particular}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {transactionTypeLabels[transaction.transactionType] || transaction.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {transaction.debit > 0 ? (
                          <span className="font-semibold text-red-600">₹{transaction.debit.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {transaction.credit > 0 ? (
                          <span className="font-semibold text-green-600">₹{transaction.credit.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold">
                        <span className={transaction.runningBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                          ₹{transaction.runningBalance.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No transactions found matching your filters
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
                <p className="text-sm text-gray-600 mb-1">Udhar Transactions</p>
                <p className="text-2xl font-bold text-red-600">{filteredTransactions.filter(t => t.debit > 0).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Jama Transactions</p>
                <p className="text-2xl font-bold text-green-600">{filteredTransactions.filter(t => t.credit > 0).length}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
