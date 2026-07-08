'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params.id;
  const [customer, setCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('udhar_cash');
  const [formData, setFormData] = useState({
    particular: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${customerId}`);
      const data = await response.json();
      setCustomer(data.customer);
      setLedgerEntries(data.ledgerEntries || []);
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          transactionType,
          particular: formData.particular,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          date: formData.date,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setShowTransactionModal(false);
      setFormData({
        particular: '',
        amount: '',
        paymentMethod: 'cash',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchCustomerData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="ml-64 min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!customer) {
    return <div className="ml-64 min-h-screen bg-gray-50 flex items-center justify-center">Customer not found</div>;
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{customer.mobileNumber}</p>
          </div>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Add Transaction
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Current Balance</p>
            <h3 className={`text-3xl font-bold ${customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{customer.currentBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-500 mt-2">{customer.currentBalance > 0 ? 'You owe' : 'You are owed'}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Udhar</p>
            <h3 className="text-3xl font-bold text-red-600">₹{customer.totalUdhar.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Debit / Owe</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Jama</p>
            <h3 className="text-3xl font-bold text-green-600">₹{customer.totalJama.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-gray-500 mt-2">Credit / Paid</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Transactions</p>
            <h3 className="text-3xl font-bold text-gray-900">{ledgerEntries.length}</h3>
            <p className="text-xs text-gray-500 mt-2">Total records</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Village</p>
              <p className="font-medium text-gray-900">{customer.village || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium text-gray-900">{customer.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aadhaar</p>
              <p className="font-medium text-gray-900">{customer.aadhaar || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">GST Number</p>
              <p className="font-medium text-gray-900">{customer.gstNumber || '-'}</p>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Digital Bahi-Khata (Ledger)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Particular</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Debit (Udhar)</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Credit (Jama)</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ledgerEntries.map((entry, idx) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{entry.particular}</p>
                        {entry.quantity && (
                          <p className="text-xs text-gray-500">
                            {entry.quantity} {entry.unit}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {entry.debit > 0 ? (
                        <span className="font-semibold text-red-600">₹{entry.debit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {entry.credit > 0 ? (
                        <span className="font-semibold text-green-600">₹{entry.credit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold">
                      <span className={entry.runningBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                        ₹{entry.runningBalance.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ledgerEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </main>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Transaction</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="udhar_cash">Udhar (Cash Loan)</option>
                  <option value="jama_cash">Jama (Cash Payment)</option>
                  <option value="jama_upi">Jama (UPI Payment)</option>
                  <option value="jama_bank">Jama (Bank Transfer)</option>
                  <option value="jama_cheque">Jama (Cheque)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Particular *</label>
                <input
                  type="text"
                  name="particular"
                  value={formData.particular}
                  onChange={handleFormChange}
                  placeholder="e.g., Soyabean Sale, Cash Payment"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
