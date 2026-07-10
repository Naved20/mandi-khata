'use client';

import { useState, useEffect } from 'react';
import { getAuthHeaders } from '@/utils/api';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory', {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/inventory/${editingId}` : '/api/inventory';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
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
        itemName: '',
        price: '',
        notes: '',
      });
      fetchInventory();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/inventory/${id}`, {
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

      fetchInventory();
      alert('Item deleted successfully');
    } catch (error) {
      alert(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (item) => {
    setEditingId(item._id);
    setFormData({
      itemName: item.itemName,
      price: item.price || item.sellingPrice || '',
      notes: item.notes || '',
    });
    setShowModal(true);
    
    // Fetch price history for this item
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/inventory/${item._id}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      setPriceHistory(data.priceHistory || []);
    } catch (error) {
      console.error('Error fetching price history:', error);
      setPriceHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your items</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm sm:text-base"
          >
            Add Item
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Item Name</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                      <a href={`/dashboard/user/inventory/${item._id}`} className="text-green-600 hover:text-green-700 hover:underline">
                        {item.itemName}
                      </a>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-semibold">
                      ₹{(item.price || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting}
                        className="px-2 sm:px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setPriceHistory([]);
                  setFormData({
                    itemName: '',
                    price: '',
                    notes: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Grid Layout: Form on Left, History on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter price"
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
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditingId(null);
                          setPriceHistory([]);
                          setFormData({
                            itemName: '',
                            price: '',
                            notes: '',
                          });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm"
                      >
                        {editingId ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Price History Section - Only show when editing */}
                {editingId && (
                  <div className="border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Price History</h3>
                    
                    {loadingHistory ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading history...</p>
                      </div>
                    ) : priceHistory.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {priceHistory.map((history) => (
                          <div 
                            key={history._id}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                history.changeType === 'created' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {history.changeType}
                              </span>
                              <span className="text-xs text-gray-600">
                                {new Date(history.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'short',
                                  timeStyle: 'short'
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                {history.changeType === 'created' ? (
                                  <span className="text-gray-600">Initial price</span>
                                ) : (
                                  <span className="text-red-600 line-through">₹{(history.oldPrice || 0).toLocaleString('en-IN')}</span>
                                )}
                              </div>
                              <div className="text-green-600 font-semibold">
                                ₹{(history.newPrice || 0).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            {history.notes && (
                              <p className="text-xs text-gray-600 mt-2 italic">{history.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No price changes yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
