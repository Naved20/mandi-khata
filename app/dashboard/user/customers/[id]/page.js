'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { exportToCSV, downloadLedgerPDF, printContent } from '@/utils/exportUtils';

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params.id;
  const [customer, setCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('udhar_cash');
  const [formData, setFormData] = useState({
    particular: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    inventoryItemId: '',
    quantity: '',
  });

  const fetchCustomerData = useCallback(async () => {
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
  }, [customerId]);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  }, []);

  useEffect(() => {
    fetchCustomerData();
    fetchInventory();
  }, [fetchCustomerData, fetchInventory]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      if (transactionType === 'udhar_inventory') {
        if (!formData.inventoryItemId || !formData.quantity) {
          throw new Error('Please select inventory item and quantity');
        }
        if (parseInt(formData.quantity) <= 0) {
          throw new Error('Quantity must be greater than 0');
        }
        const inventoryItem = inventory.find(i => i._id === formData.inventoryItemId);
        if (!inventoryItem) {
          throw new Error('Inventory item not found');
        }
        const amount = parseInt(formData.quantity) * inventoryItem.sellingPrice;

        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            transactionType,
            particular: `${inventoryItem.itemName} - ${formData.quantity} ${inventoryItem.unit}`,
            amount,
            inventoryItemId: formData.inventoryItemId,
            quantity: parseInt(formData.quantity),
            paymentMethod: 'none',
            notes: formData.notes,
            date: formData.date,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error);
        }
      } else {
        // Validate amount for cash transactions
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          throw new Error('Amount must be greater than 0');
        }

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
      }

      setShowTransactionModal(false);
      setTransactionType('udhar_cash');
      setFormData({
        particular: '',
        amount: '',
        paymentMethod: 'cash',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        inventoryItemId: '',
        quantity: '',
      });
      fetchCustomerData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="  min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!customer) {
    return <div className="  min-h-screen bg-gray-50 flex items-center justify-center">Customer not found</div>;
  }

  return (
    <div className="  min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{customer.mobileNumber}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadLedgerPDF(customer.name, ledgerEntries)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Ledger
            </button>
            <button
              onClick={() => printContent('ledger-table', `${customer.name} - Digital Ledger`)}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm2-6a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Print Ledger
            </button>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Add Transaction
            </button>
          </div>
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
          
          <div className="overflow-x-auto" id="ledger-table">
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

        {/* Customer Purchase History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Purchase History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Item / Particular</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ledgerEntries
                  .filter(entry => entry.debit > 0 && entry.transactionType.startsWith('udhar'))
                  .map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {entry.particular}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {entry.quantity ? `${entry.quantity} ${entry.unit}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                        ₹{entry.debit.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          {entry.transactionType === 'udhar_inventory' ? 'Inventory' : 'Cash'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {ledgerEntries.filter(entry => entry.debit > 0).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No purchase history
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
                  onChange={(e) => {
                    setTransactionType(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      particular: '',
                      amount: '',
                      inventoryItemId: '',
                      quantity: '',
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <optgroup label="Udhar">
                    <option value="udhar_cash">Cash Loan</option>
                    <option value="udhar_inventory">Inventory Udhar</option>
                  </optgroup>
                  <optgroup label="Jama">
                    <option value="jama_cash">Cash Payment</option>
                    <option value="jama_upi">UPI Payment</option>
                    <option value="jama_bank">Bank Transfer</option>
                    <option value="jama_cheque">Cheque</option>
                  </optgroup>
                </select>
              </div>

              {/* Inventory Udhar Section */}
              {transactionType === 'udhar_inventory' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item *</label>
                    <select
                      value={formData.inventoryItemId}
                      onChange={(e) => setFormData(prev => ({ ...prev, inventoryItemId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select an item</option>
                      {inventory.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.itemName} (Stock: {item.currentStock} {item.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      placeholder="Enter quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  {formData.inventoryItemId && formData.quantity && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Calculated Amount:</span> ₹
                        {(
                          parseInt(formData.quantity) * 
                          (inventory.find(i => i._id === formData.inventoryItemId)?.sellingPrice || 0)
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Cash/Other Transactions Section */}
              {transactionType !== 'udhar_inventory' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Particular *</label>
                    <input
                      type="text"
                      name="particular"
                      value={formData.particular}
                      onChange={handleFormChange}
                      placeholder="e.g., Advance Payment"
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
                </>
              )}

              {/* Payment Method for Jama */}
              {transactionType.startsWith('jama_') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              )}

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
                  onClick={() => {
                    setShowTransactionModal(false);
                    setTransactionType('udhar_cash');
                    setFormData({
                      particular: '',
                      amount: '',
                      paymentMethod: 'cash',
                      notes: '',
                      date: new Date().toISOString().split('T')[0],
                      inventoryItemId: '',
                      quantity: '',
                    });
                  }}
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
