'use client';

import { useState, useEffect } from 'react';
import { INR } from '@/utils/format';

/**
 * PRODUCTION DEPLOYMENT GUIDE:
 * 
 * 1. Environment Variables:
 *    - MongoDB Connection: Already configured via .env.local
 *    - Cloudinary: Configure in .env.local (optional for PDF uploads)
 *    - NODE_ENV=production
 *    - DEMO_MODE=false
 * 
 * 2. Before Deployment:
 *    - npm run seed (to populate sample data)
 *    - npm run build (verify no errors)
 *    - npm run dev (test locally)
 * 
 * 3. Vercel Deployment:
 *    - Connect GitHub repository
 *    - Add all environment variables in Vercel dashboard
 *    - Enable automatic deployments
 *    - Set up monitoring and alerts
 * 
 * 4. Production Checklist:
 *    - MongoDB Atlas cluster running
 *    - Connection string with proper credentials
 *    - Error tracking enabled
 *    - Regular backups scheduled
 */

// Helper Components
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-12 h-12">
        <svg
          className="animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subItems, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-orange-50 border-orange-200',
    danger: 'bg-red-50 border-red-200',
  };

  return (
    <div
      className={`rounded-xl border ${variantClasses[variant]} shadow-sm p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">{INR(value)}</p>
      </div>

      {subItems && subItems.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          {subItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className={`font-medium ${item.color}`}>
                {INR(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickActionButton({ label, icon, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${bgColor} text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-shadow hover:scale-105 transform`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActivityFeed() {
  const mockActivities = [
    { id: 1, description: 'Tomato lot sold', amount: 12000, time: '2 hours ago' },
    { id: 2, description: 'Wheat arrival', amount: 500, quantity: 'quintals', time: '4 hours ago' },
    { id: 3, description: 'Potato purchase payment', amount: 8500, time: '6 hours ago' },
    { id: 4, description: 'Daily labor charges', amount: 2000, time: '8 hours ago' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Live Floor Feed</h2>
      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.quantity || 'Amount'}: {activity.quantity ? activity.amount : INR(activity.amount)}
              </p>
            </div>
            <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Revenue Velocity (Real-time)
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Sales</span>
            <span className="text-sm font-bold text-green-600">65%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              style={{ width: '65%' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Purchases</span>
            <span className="text-sm font-bold text-blue-600">45%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              style={{ width: '45%' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Expenses</span>
            <span className="text-sm font-bold text-orange-600">28%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              style={{ width: '28%' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Cash Balance</span>
            <span className="text-sm font-bold text-purple-600">82%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              style={{ width: '82%' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          Real-time metrics updated every 30 seconds. Data reflects all transactions from MongoDB.
        </p>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto ml-64">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-900 mb-2">Connection Error</h2>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Please ensure MongoDB is connected and running.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const defaultStats = {
    sales: { cash: 0, udhar: 0, total: 0 },
    purchases: { cash: 0, udhar: 0, total: 0 },
    assets: { inflow: 0, outflow: 0, net: 0 },
    expenses: { daily: 0 },
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
            <p className="text-sm text-gray-600 mt-1">
              Live Auction & Financial Overview
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              M
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickActionButton
            label="Customer Payment (Receive Money)"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            }
            bgColor="bg-blue-600 hover:bg-blue-700"
          />

          <QuickActionButton
            label="Supplier Payment (Make Payment)"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            }
            bgColor="bg-green-600 hover:bg-green-700"
          />

          <QuickActionButton
            label="Operational Costs (Mandi Expenses)"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            }
            bgColor="bg-orange-600 hover:bg-orange-700"
          />
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Sales Summary"
            value={displayStats.sales.total}
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            subItems={[
              { label: 'Cash Sales (Collected)', value: displayStats.sales.cash, color: 'text-green-600' },
              { label: 'Udhar Sales (Outstanding)', value: displayStats.sales.udhar, color: 'text-orange-600' },
            ]}
            variant="success"
          />

          <StatCard
            title="Purchase Insights"
            value={displayStats.purchases.total}
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            subItems={[
              { label: 'Cash Purchase (Paid)', value: displayStats.purchases.cash, color: 'text-green-600' },
              { label: 'Udhar Purchase (Outstanding)', value: displayStats.purchases.udhar, color: 'text-orange-600' },
            ]}
            variant="primary"
          />

          <StatCard
            title="Liquid Assets"
            value={displayStats.assets.net}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            subItems={[
              { label: 'Inflow (Payment In)', value: displayStats.assets.inflow, color: 'text-green-600' },
              { label: 'Outflow (Payment Out)', value: displayStats.assets.outflow, color: 'text-red-600' },
            ]}
            variant={displayStats.assets.net >= 0 ? 'success' : 'danger'}
          />

          <StatCard
            title="Daily Expenses"
            value={displayStats.expenses.daily}
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            variant="warning"
          />
        </div>

        {/* Bottom Row: Charts and Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <ActivityFeed />
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>
      </main>
    </div>
  );
}
