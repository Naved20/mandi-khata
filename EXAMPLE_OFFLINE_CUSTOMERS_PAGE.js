// EXAMPLE: How to convert customers page to use offline-first architecture
// Copy this pattern to app/dashboard/user/customers/page.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOfflineData } from '@/lib/hooks/useOfflineData';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/lib/db/repositories/customer.repo';

export default function CustomersPageOffline() {
  // 🔥 NEW: Use offline-first hook instead of useEffect + fetch
  // This automatically reads from IndexedDB and updates in real-time!
  const { data: customers, loading, error } = useOfflineData('customers');

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    village: '',
    address: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mobile number format
    if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      alert('Mobile number should be 10 digits');
      return;
    }

    try {
      setSubmitting(true);

      // 🔥 NEW: Save to IndexedDB instead of API call
      // Data will be automatically synced to MongoDB when online!
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await createCustomer(formData);
      }

      // Reset form
      setShowModal(false);
      setEditingId(null);
      setFormData({
        name: '',
        mobileNumber: '',
        village: '',
        address: '',
        notes: '',
      });

      // No need to manually refresh! useOfflineData hook auto-updates
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      // 🔥 NEW: Delete from IndexedDB instead of API call
      await deleteCustomer(id);
      // No need to manually refresh! useOfflineData hook auto-updates
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      mobileNumber: customer.mobileNumber || '',
      village: customer.village || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.mobileNumber, customer.village]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            👥 Customers (Udhari Parties)
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage your credit parties and track outstanding balances
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              mobileNumber: '',
              village: '',
              address: '',
              notes: '',
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          + Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name, mobile, or village..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading customers...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">⚠️ Error loading customers: {error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
          </p>
          <p className="text-gray-500 mt-2">
            {!searchTerm && 'Click "Add Customer" to get started'}
          </p>
        </div>
      )}

      {/* Customers Grid */}
      {!loading && !error && filteredCustomers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-600">📞 {customer.mobileNumber}</p>
                  {customer.village && (
                    <p className="text-sm text-gray-600">📍 {customer.village}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Balance Display */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outstanding:</span>
                  <span
                    className={`font-bold ${
                      customer.balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    ₹{Math.abs(customer.balance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* View Details Button */}
              <Link
                href={`/dashboard/user/customers/${customer.id}`}
                className="block mt-3 text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🔥 KEY CHANGES FROM OLD VERSION:
 * 
 * 1. REMOVED:
 *    - useEffect(() => { fetchCustomers(); }, []);
 *    - const fetchCustomers = async () => { ... fetch('/api/customers') ... };
 * 
 * 2. ADDED:
 *    - const { data: customers, loading, error } = useOfflineData('customers');
 * 
 * 3. CHANGED handleSubmit:
 *    OLD: await fetch('/api/customers', { method: 'POST', ...})
 *    NEW: await createCustomer(formData);
 * 
 * 4. CHANGED handleDelete:
 *    OLD: await fetch(`/api/customers/${id}`, { method: 'DELETE', ...})
 *    NEW: await deleteCustomer(id);
 * 
 * 5. NO MORE:
 *    - fetchCustomers() calls after create/update/delete
 *    - Auth header management
 *    - Network error handling
 *    - Manual loading states
 * 
 * 6. BENEFITS:
 *    - ⚡ Instant loading from IndexedDB
 *    - 🚀 Works offline
 *    - 🔄 Auto-sync when online
 *    - 📡 Real-time updates via Dexie live queries
 *    - 🎯 Less code, simpler logic
 */
