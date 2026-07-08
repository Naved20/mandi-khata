'use client';

import { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    currentStock: 0,
    unit: 'quintal',
    buyingPrice: '',
    sellingPrice: '',
    reorderLevel: 0,
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentStock: parseInt(formData.currentStock),
          buyingPrice: parseFloat(formData.buyingPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          reorderLevel: parseInt(formData.reorderLevel),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        itemName: '',
        category: '',
        currentStock: 0,
        unit: 'quintal',
        buyingPrice: '',
        sellingPrice: '',
        reorderLevel: 0,
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
      });

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

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      buyingPrice: item.buyingPrice,
      sellingPrice: item.sellingPrice,
      reorderLevel: item.reorderLevel,
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(inventory.map(item => item.category))];

  if (loading) {
    return <div className="  min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="  min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your stock and items</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Add Item
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Buying Price</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Selling Price</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Profit Margin</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const margin = ((item.sellingPrice - item.buyingPrice) / item.buyingPrice * 100).toFixed(0);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <a href={`/dashboard/user/inventory/${item._id}`} className="text-green-600 hover:text-green-700 hover:underline">
                          {item.itemName}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="font-semibold">{item.currentStock}</span>
                        <span className="text-gray-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">₹{item.buyingPrice}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">₹{item.sellingPrice}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {margin}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleting}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData({
                    itemName: '',
                    category: '',
                    currentStock: 0,
                    unit: 'quintal',
                    buyingPrice: '',
                    sellingPrice: '',
                    reorderLevel: 0,
                    notes: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="e.g., Grains, Vegetables"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="quintal">Quintal</option>
                  <option value="kg">KG</option>
                  <option value="liter">Liter</option>
                  <option value="piece">Piece</option>
                  <option value="bag">Bag</option>
                  <option value="box">Box</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buying Price *</label>
                <input
                  type="number"
                  step="0.01"
                  name="buyingPrice"
                  value={formData.buyingPrice}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                <input
                  type="number"
                  step="0.01"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleFormChange}
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
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({
                      itemName: '',
                      category: '',
                      currentStock: 0,
                      unit: 'quintal',
                      buyingPrice: '',
                      sellingPrice: '',
                      reorderLevel: 0,
                      notes: '',
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
