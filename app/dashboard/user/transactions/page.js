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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-xs text-gray-500 mt-1">All ledger entries</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-20">
        {/* Summary - Compact Cards */}
        <div className="space-y-3 mb-6">
          {/* Main Balance Card */}
          <div className={`bg-gradient-to-br rounded-xl border p-4 ${
            netBalance > 0 
              ? 'from-red-50 to-red-100 border-red-200' 
              : 'from-green-50 to-green-100 border-green-200'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-medium ${netBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  Net Balance
                </p>
                <h2 className={`text-2xl font-bold mt-1 ${netBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{(netBalance || 0).toLocaleString('en-IN')}
                </h2>
                <p className={`text-xs mt-2 ${netBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {netBalance > 0 ? 'You owe' : 'You are owed'}
                </p>
              </div>
              <div className="text-3xl">{netBalance > 0 ? '📈' : '📊'}</div>
            </div>
          </div>

          {/* Debit/Credit Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-lg border border-red-200 p-3">
              <p className="text-xs text-red-700 font-medium">Total Udhar</p>
              <p className="text-lg font-bold text-red-600 mt-1">₹{(totalDebit / 1000).toFixed(1)}K</p>
              <p className="text-xs text-red-600 mt-1">{filteredTransactions.filter(t => t.debit > 0).length} entries</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-3">
              <p className="text-xs text-green-700 font-medium">Total Jama</p>
              <p className="text-lg font-bold text-green-600 mt-1">₹{(totalCredit / 1000).toFixed(1)}K</p>
              <p className="text-xs text-green-600 mt-1">{filteredTransactions.filter(t => t.credit > 0).length} entries</p>
            </div>
          </div>
        </div>

        {/* Filters - Sticky */}
        <div className="sticky top-16 z-30 bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200 space-y-2 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="udhar">Udhar</option>
              <option value="jama">Jama</option>
            </select>

            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Customers</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>{customer.name.substring(0, 15)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-300"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg text-sm transition-colors"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 rounded-lg text-sm transition-colors"
          >
            💾 Export
          </button>
        </div>

        {/* Transactions List - Card Based */}
        <div className="space-y-2" id="transactions-table">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, idx) => (
              <div
                key={transaction._id || idx}
                className="bg-white rounded-lg border border-gray-200 p-3 shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Top Row: Date & Type */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {typeof transaction.customerId === 'string' ? 'Unknown' : (transaction.customerId?.name || 'Unknown')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    transaction.transactionType === 'udhar'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {transactionTypeLabels[transaction.transactionType] || transaction.transactionType}
                  </span>
                </div>

                {/* Description */}
                {(transaction.particular || transaction.notes) && (
                  <p className="text-xs text-gray-600 mb-2 truncate">
                    {transaction.particular || transaction.notes}
                  </p>
                )}

                {/* Amount - Large and Clear */}
                <div className="bg-gray-50 rounded-lg p-2 mb-0">
                  {transaction.debit > 0 && (
                    <p className="text-lg font-bold text-red-600">
                      ₹{(transaction.debit || 0).toLocaleString('en-IN')} (Udhar)
                    </p>
                  )}
                  {transaction.credit > 0 && (
                    <p className="text-lg font-bold text-green-600">
                      ₹{(transaction.credit || 0).toLocaleString('en-IN')} (Jama)
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No transactions found</p>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-lg font-bold text-gray-900">{filteredTransactions.length}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Udhar</p>
                <p className="text-lg font-bold text-red-600">₹{(totalDebit || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Jama</p>
                <p className="text-lg font-bold text-green-600">₹{(totalCredit || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
