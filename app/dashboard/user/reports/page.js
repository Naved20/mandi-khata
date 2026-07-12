'use client';

import { useState, useEffect } from 'react';
import { exportToCSV, printContent } from '@/utils/exportUtils';
import { getAuthHeaders } from '@/utils/api';

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
        fetch('/api/customers', {
          headers: getAuthHeaders(),
        }),
        fetch('/api/transactions', {
          headers: getAuthHeaders(),
        })
      ]);
      
      if (customersRes.status === 401 || transactionsRes.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
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
      outstanding: c.currentBalance || 0,
      totalUdhar: c.totalUdhar || 0,
      totalJama: c.totalJama || 0,
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
        totalAmount: outstandingCustomers.reduce((sum, c) => sum + (c.outstanding || 0), 0),
      },
      sales: {
        count: salesData.length,
        totalAmount: salesData.reduce((sum, t) => sum + (t.debit || 0), 0),
      },
      payments: {
        count: paymentData.length,
        totalAmount: paymentData.reduce((sum, t) => sum + (t.credit || 0), 0),
      },
    };
  };

  const reportStats = calculateReportStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading reports...</p>
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
        'Outstanding (₹)': row.outstanding,
        'Total Udhar (₹)': row.totalUdhar,
        'Total Jama (₹)': row.totalJama,
      }));
      filename = 'outstanding_report';
    } else if (reportType === 'sales') {
      dataToExport = salesData.map(tx => ({
        'Date': new Date(tx.date).toLocaleDateString('en-IN'),
        'Customer': tx.customerId?.name || '-',
        'Particular': tx.particular,
        'Amount (₹)': tx.debit,
      }));
      filename = 'sales_report';
    } else if (reportType === 'payments') {
      dataToExport = paymentData.map(tx => ({
        'Date': new Date(tx.date).toLocaleDateString('en-IN'),
        'Customer': tx.customerId?.name || '-',
        'Particular': tx.particular,
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-1">Business insights & analytics</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-20">
        {/* Summary Stats - Compact */}
        <div className="space-y-3 mb-6">
          <div className="bg-orange-50 rounded-lg border border-orange-200 p-3">
            <p className="text-xs text-orange-700 font-medium">Outstanding</p>
            <p className="text-xl font-bold text-orange-600 mt-1">₹{(reportStats.outstanding.totalAmount || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-orange-600 mt-1">{reportStats.outstanding.count} customers</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-lg border border-red-200 p-3">
              <p className="text-xs text-red-700 font-medium">Sales (Udhar)</p>
              <p className="text-lg font-bold text-red-600 mt-1">₹{((reportStats.sales.totalAmount || 0) / 1000).toFixed(1)}K</p>
              <p className="text-xs text-red-600 mt-1">{reportStats.sales.count} entries</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-3">
              <p className="text-xs text-green-700 font-medium">Payments (Jama)</p>
              <p className="text-lg font-bold text-green-600 mt-1">₹{((reportStats.payments.totalAmount || 0) / 1000).toFixed(1)}K</p>
              <p className="text-xs text-green-600 mt-1">{reportStats.payments.count} entries</p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="sticky top-16 z-30 bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200 space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 font-medium">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-300"
            >
              Clear Dates
            </button>
          )}
        </div>

        {/* Report Type Tabs - Horizontal Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'outstanding', label: '📋 Outstanding', count: reportStats.outstanding.count },
            { id: 'sales', label: '📈 Sales', count: reportStats.sales.count },
            { id: 'payments', label: '💰 Payments', count: reportStats.payments.count }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                reportType === tab.id
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
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

        {/* Report Content */}
        <div id="report-content">
          {/* Outstanding Report */}
          {reportType === 'outstanding' && (
            <div className="space-y-3">
              {outstandingData.length > 0 ? (
                outstandingData.map((row) => (
                  <div key={row.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">{row.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{row.mobile}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2">
                        Pending
                      </span>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-orange-700 font-medium">Outstanding</p>
                      <p className="text-2xl font-bold text-orange-600 mt-1">₹{(row.outstanding || 0).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="text-xs text-red-700 font-medium">Udhar</p>
                        <p className="text-sm font-bold text-red-600 mt-1">₹{(row.totalUdhar || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-green-700 font-medium">Jama</p>
                        <p className="text-sm font-bold text-green-600 mt-1">₹{(row.totalJama || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 text-sm">✅ No outstanding records</p>
                </div>
              )}
            </div>
          )}

          {/* Sales Report */}
          {reportType === 'sales' && (
            <div className="space-y-3">
              {salesData.length > 0 ? (
                salesData.map((tx) => (
                  <div key={tx._id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {tx.customerId?.name || 'Unknown'}
                        </p>
                      </div>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                        Udhar
                      </span>
                    </div>

                    {tx.particular && (
                      <p className="text-xs text-gray-600 mb-2 truncate">{tx.particular}</p>
                    )}

                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-red-600">
                        ₹{(tx.debit || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 text-sm">No sales records for this period</p>
                </div>
              )}
            </div>
          )}

          {/* Payments Report */}
          {reportType === 'payments' && (
            <div className="space-y-3">
              {paymentData.length > 0 ? (
                paymentData.map((tx) => (
                  <div key={tx._id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {tx.customerId?.name || 'Unknown'}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        Jama
                      </span>
                    </div>

                    {tx.particular && (
                      <p className="text-xs text-gray-600 mb-2 truncate">{tx.particular}</p>
                    )}

                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-green-600">
                        ₹{(tx.credit || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 text-sm">No payment records for this period</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
