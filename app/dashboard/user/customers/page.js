'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthHeaders } from '@/utils/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  const [deleting, setDeleting] = useState(false);

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/customers', {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers || []);
        } else {
          throw new Error('Failed to load customers');
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        alert('Error loading customers: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mobile number format
    if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      alert('Mobile number should be 10 digits');
      return;
    }

    try {
      const url = editingId ? `/api/customers/${editingId}` : '/api/customers';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        name: '',
        mobileNumber: '',
        village: '',
        address: '',
        notes: '',
      });
      
      // Refresh data after submit
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      window.location.reload();
      alert('Customer deleted successfully');
    } catch (error) {
      alert(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id || customer.id);
    setFormData({
      name: customer.name,
      mobileNumber: customer.mobileNumber,
      village: customer.village || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.mobileNumber.includes(searchTerm);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 sm:h-10 w-8 sm:w-10 border-b-2 border-green-600"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">Manage customer ledgers and accounts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-xs sm:text-sm lg:text-base"
          >
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">+ Add</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        {/* Customer Cards Grid - Mobile responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer._id || customer.id} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
              <Link href={`/dashboard/user/customers/${customer._id || customer.id}`}>
                <div className="flex items-start justify-between mb-3 sm:mb-4 cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">{customer.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{customer.mobileNumber}</p>
                  </div>
                </div>

                {customer.village && (
                  <p className="text-xs text-gray-600 mb-3 sm:mb-4 truncate">{customer.village}</p>
                )}

                {/* Stats */}
                <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Balance:</span>
                    <span className={`font-semibold ${customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{customer.currentBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Udhar:</span>
                    <span className="font-semibold text-red-600">₹{customer.totalUdhar.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Jama:</span>
                    <span className="font-semibold text-green-600">₹{customer.totalJama.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {customer.lastTransactionDate && (
                  <p className="text-xs text-gray-500 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                    Last: {new Date(customer.lastTransactionDate).toLocaleDateString('en-IN')}
                  </p>
                )}
              </Link>

              {/* Action Buttons - Mobile compact */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(customer._id || customer.id)}
                  disabled={deleting}
                  className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-50 text-red-600 rounded-lg font-medium text-xs hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </main>

      {/* Modal - Mobile responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    mobileNumber: '',
                    village: '',
                    address: '',
                    notes: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Village</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      mobileNumber: '',
                      village: '',
                      address: '',
                      notes: '',
                    });
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
