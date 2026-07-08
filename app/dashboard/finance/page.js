'use client';

import { useState } from 'react';
import { INR } from '@/utils/format';

function FinanceMetric({ label, value, change, isPositive }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-2">{INR(value)}</p>
      <div className="flex items-center gap-1">
        <svg
          className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isPositive ? (
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 1.414L9.414 13H12z" clipRule="evenodd" />
          )}
        </svg>
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
    </div>
  );
}

function ExpenseItem({ item, amount, percentage }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{item}</p>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <p className="ml-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{INR(amount)}</p>
    </div>
  );
}

export default function FinancePage() {
  const [view, setView] = useState('overview');

  // Demo financial data
  const financialData = {
    totalRevenue: 847500,
    totalExpenses: 185300,
    netProfit: 662200,
    cashPosition: 485600,
    receivables: 215000,
    payables: 125000,
    revenueChange: 15.8,
    expenseChange: -8.2,
    profitChange: 22.5,
    cashChange: 18.3,
  };

  const expenseBreakdown = [
    { item: 'Labor Charges', amount: 45000, percentage: 24 },
    { item: 'Transport & Logistics', amount: 38500, percentage: 21 },
    { item: 'Commission & Fees', amount: 52100, percentage: 28 },
    { item: 'Utilities & Rent', amount: 29200, percentage: 16 },
    { item: 'Other Expenses', amount: 20500, percentage: 11 },
  ];

  const balanceSheet = [
    { category: 'Assets', items: [
      { name: 'Cash in Hand', value: 125000 },
      { name: 'Bank Balance', value: 360600 },
      { name: 'Receivables', value: 215000 },
      { name: 'Stock Value', value: 450000 },
    ]},
    { category: 'Liabilities', items: [
      { name: 'Payables', value: 125000 },
      { name: 'Pending Bills', value: 85000 },
    ]},
  ];

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Complete financial overview and accounting</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FinanceMetric
            label="Total Revenue"
            value={financialData.totalRevenue}
            change={financialData.revenueChange}
            isPositive={true}
          />
          <FinanceMetric
            label="Total Expenses"
            value={financialData.totalExpenses}
            change={financialData.expenseChange}
            isPositive={true}
          />
          <FinanceMetric
            label="Net Profit"
            value={financialData.netProfit}
            change={financialData.profitChange}
            isPositive={true}
          />
          <FinanceMetric
            label="Cash Position"
            value={financialData.cashPosition}
            change={financialData.cashChange}
            isPositive={true}
          />
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          {['overview', 'expenses', 'balance'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded font-medium transition-colors capitalize ${
                view === v
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {v === 'overview' ? 'Overview' : v === 'expenses' ? 'Expenses' : 'Balance Sheet'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {view === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Financial Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <p className="text-gray-700">Total Revenue</p>
                  <p className="font-bold text-gray-900">{INR(financialData.totalRevenue)}</p>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <p className="text-gray-700">Total Expenses</p>
                  <p className="font-bold text-red-600">{INR(financialData.totalExpenses)}</p>
                </div>
                <div className="flex items-center justify-between pt-2 bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">Net Profit</p>
                  <p className="text-lg font-bold text-green-600">{INR(financialData.netProfit)}</p>
                </div>
              </div>
            </div>

            {/* Working Capital */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Working Capital</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <p className="text-gray-700">Cash Position</p>
                  <p className="font-bold text-green-600">{INR(financialData.cashPosition)}</p>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <p className="text-gray-700">Receivables (To Collect)</p>
                  <p className="font-bold text-blue-600">{INR(financialData.receivables)}</p>
                </div>
                <div className="flex items-center justify-between pt-2 bg-orange-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">Payables (To Pay)</p>
                  <p className="font-bold text-orange-600">{INR(financialData.payables)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {view === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expense Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Expense Breakdown</h2>
              <div>
                {expenseBreakdown.map((expense, idx) => (
                  <ExpenseItem
                    key={idx}
                    item={expense.item}
                    amount={expense.amount}
                    percentage={expense.percentage}
                  />
                ))}
              </div>
            </div>

            {/* Expense Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Total Expenses</h2>
              <p className="text-4xl font-bold text-red-600 mb-6">
                {INR(financialData.totalExpenses)}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Highest Expense</span>
                  <span className="font-semibold">Commission & Fees</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">% of Revenue</span>
                  <span className="font-semibold">
                    {((financialData.totalExpenses / financialData.totalRevenue) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Sheet Tab */}
        {view === 'balance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {balanceSheet.map((section, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{section.category}</h2>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-gray-700">{item.name}</p>
                      <p className="font-semibold text-gray-900">{INR(item.value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t-2 border-gray-300">
                  <p className="flex items-center justify-between font-bold text-gray-900">
                    <span>Total {section.category}</span>
                    <span>
                      {INR(
                        section.items.reduce((sum, item) => sum + item.value, 0)
                      )}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
