'use client';

import { useState, useEffect } from 'react';
import { exportToCSV, printContent } from '@/utils/exportUtils';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('outstanding');
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, transactionsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/transactions')
      ]);
      
      const customersData = await customersRes.json();
      const transactionsData = await transactionsRes.json();
      
      setCustomers(customersData.customers || []);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOutstandingReport = () => {
    return customers.map(c => ({
      id: c._id,
      name: c.name,
      mobile: c.mobileNumber,
      type: c.customerType,
      outstanding: c.currentBalance,
      totalUdhar: c.totalUdhar,
      totalJama: c.totalJama,
      lastTransaction: c.lastTransactionDate,
    })).filter(c => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding);
  };

  const getSalesReport = () => {
    return transactions.filter(t => t.debit > 0 && isDateInRange(t.date)).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getPaymentReport = () => {
    return transactions.filter(t => t.credit > 0 && isDateInRange(t.date)).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const isDateInRange = (date) => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(date);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (txDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (txDate > end) return false;
    }
    return true;
  };

  const calculateReportStats = () => {
    const outstandingCustomers = getOutstandingReport();
    const salesData = getSalesReport();
    const paymentData = getPaymentReport();

    return {
      outstanding: {
        count: outstandingCustomers.length,
        totalAmount: outstandingCustomers.reduce((sum, c) => sum + c.outstanding, 0),
      },
      sales: {
        count: salesData.length,
        totalAmount: salesData.reduce((sum, t) => sum + t.debit, 0),
      },
      payments: {
        count: paymentData.length,
        totalAmount: paymentData.reduce((sum, t) => sum + t.credit, 0),
      },
      pending: {
        count: customers.filter(c => c.currentBalance > 0).length,
        totalAmount: customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0),
      },
    };
  };

  const reportStats = calculateReportStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const outstandingData = getOutstandingReport();
  const salesData = getSalesReport();
  const paymentData = getPaymentReport();

  const handleExportCSV = () => {
    let dataToExport = [];
    let filename = 'report';

    if (reportType === 'outstanding') {
      dataToExport = outstandingData.map(row => ({
        'Customer Name': row.name,
        'Mobile': row.mobile,
        'Type': row.type,
        'Outstanding (₹)': row.outstanding,
        'Total Udhar (₹)': row.totalUdhar,
        'Total Jama (₹)': row.totalJama,
      }));
      filename = 'outstanding_report';
    } else if (reportType === 'pending') {
      dataToExport = customers
        .filter(c => c.currentBalance > 0)
        .sort((a, b) => b.currentBalance - a.currentBalance)
        .map(customer => ({
          'Customer Name': customer.name,
          'Mobile': customer.mobileNumber,
          'Type': customer.customerType,
          'Pending Amount (₹)': customer.currentBalance,
          'Last Transaction': customer.lastTransactionDate ? new Date(customer.lastTransactionDate).toLocaleDateString('en-IN') : '-',
        }));
      filename = 'pending_payments_report';
    } else if (reportType === 'sales') {
      dataToExport = salesData.map(tx => ({
        'Date': new Date(tx.date).toLocaleDateString('en-IN'),
        'Customer': tx.customerId?.name || '-',
        'Particular': tx.particular,
        'Type': tx.transactionType,
        'Amount (₹)': tx.debit,
      }));
      filename = 'sales_report';
    } else if (reportType === 'payments') {
      dataToExport = paymentData.map(tx => ({
        'Date': new Date(tx.date).toLocaleDateString('en-IN'),
        'Customer': tx.customerId?.name || '-',
        'Particular': tx.particular,
        'Method': tx.paymentMethod,
        'Amount (₹)': tx.credit,
      }));
      filename = 'payments_report';
    }

    if (dataToExport.length > 0) {
      exportToCSV(dataToExport, filename);
    }
  };

  const handlePrint = () => {
    printContent('report-content', `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40  ">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">View detailed business reports and insights</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Outstanding</p>
            <h3 className="text-3xl font-bold text-orange-600">₹{reportStats.outstanding.totalAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">{reportStats.outstanding.count} customers</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Sales (Udhar)</p>
            <h3 className="text-3xl font-bold text-red-600">₹{reportStats.sales.totalAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">{reportStats.sales.count} transactions</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Payments (Jama)</p>
            <h3 className="text-3xl font-bold text-green-600">₹{reportStats.payments.totalAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">{reportStats.payments.count} transactions</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Pending Payments</p>
            <h3 className="text-3xl font-bold text-blue-600">₹{reportStats.pending.totalAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">{reportStats.pending.count} customers</p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'outstanding', label: 'Outstanding Report', icon: '📋' },
              { id: 'pending', label: 'Pending Payments', icon: '⏳' },
              { id: 'sales', label: 'Sales Report', icon: '📈' },
              { id: 'payments', label: 'Payment Report', icon: '💰' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  reportType === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Print and Export Buttons */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-2 justify-end">
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

          <div className="p-6" id="report-content">

          {/* Outstanding Report */}
          {reportType === 'outstanding' && (
            <div>
              {outstandingData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Outstanding</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Udhar</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Jama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {outstandingData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.mobile}</td>
                          <td className="px-6 py-4 text-sm capitalize"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{row.type}</span></td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-orange-600">
                            ₹{row.outstanding.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-red-600">
                            ₹{row.totalUdhar.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-green-600">
                            ₹{row.totalJama.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No outstanding records found
                </div>
              )}
            </div>
          )}

          {/* Pending Payments */}
          {reportType === 'pending' && (
            <div>
              {reportStats.pending.count > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Pending Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Transaction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.filter(c => c.currentBalance > 0).sort((a, b) => b.currentBalance - a.currentBalance).map((customer) => (
                        <tr key={customer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                          <td className="px-6 py-4 text-sm capitalize"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{customer.customerType}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.mobileNumber}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                            ₹{customer.currentBalance.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {customer.lastTransactionDate ? new Date(customer.lastTransactionDate).toLocaleDateString('en-IN') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No pending payments
                </div>
              )}
            </div>
          )}

          {/* Sales Report */}
          {reportType === 'sales' && (
            <div>
              {salesData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Particular</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesData.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(tx.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{tx.customerId?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{tx.particular}</td>
                          <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">{tx.transactionType}</span></td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                            ₹{tx.debit.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sales records found for the selected period
                </div>
              )}
            </div>
          )}

          {/* Payment Report */}
          {reportType === 'payments' && (
            <div>
              {paymentData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Particular</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentData.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(tx.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{tx.customerId?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{tx.particular}</td>
                          <td className="px-6 py-4 text-sm capitalize"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{tx.paymentMethod}</span></td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                            ₹{tx.credit.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment records found for the selected period
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
