'use client';

import { useEffect, useState } from 'react';
import { ordersAPI, usersAPI, productsAPI, User, Product } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export default function OrdersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, productsData] = await Promise.all([
        usersAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setUsers(usersData);
      setProducts(productsData.filter((p) => p.status === 'active'));
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openProductModal = () => {
    setSelectedProductId('');
    setShowProductModal(true);
  };

  const addProductToOrder = () => {
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }
    
    // Check if product is already in the order
    const alreadyAdded = orderItems.some(item => item.productId === selectedProductId);
    if (alreadyAdded) {
      setError('This product is already in the order');
      return;
    }

    setOrderItems([...orderItems, { productId: selectedProductId, quantity: 1 }]);
    setShowProductModal(false);
    setSelectedProductId('');
    setError(null);
  };

  const updateOrderItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    let total = 0;
    orderItems.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one product to the order');
      return;
    }

    try {
      setSubmitting(true);
      await ordersAPI.create({
        userId: selectedUserId,
        items: orderItems,
      });
      setSuccess('Order created successfully!');
      setSelectedUserId('');
      setOrderItems([]);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Create Order</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white text-black shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <select
            required
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Order Items
            </label>
            <button
              type="button"
              onClick={openProductModal}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Add Product
            </button>
            {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Product to Add
              </h3>
              
              {products.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No active products available</p>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose a product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a product...</option>
                      {products
                        .filter(p => !orderItems.some(item => item.productId === p._id))
                        .map((product) => {
                          const categoryName = typeof product.categoryId === 'object' 
                            ? (product.categoryId as any).name || 'Unknown'
                            : 'Unknown';
                          return (
                            <option key={product._id} value={product._id}>
                              {product.name} 
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  
                  {selectedProductId && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      {(() => {
                        const selectedProduct = products.find(p => p._id === selectedProductId);
                        return selectedProduct ? (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {selectedProduct.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Price: ${selectedProduct.price.toFixed(2)}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedProductId('');
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addProductToOrder}
                  disabled={!selectedProductId}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>

          {orderItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No products added. Click "Add Product" to start.</p>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item, index) => {
                const product = products.find((p) => p._id === item.productId);
                const itemTotal = product ? product.price * item.quantity : 0;

                return (
                  <div key={index} className="border border-gray-300 rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} - ${p.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Total
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeOrderItem(index)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || orderItems.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded"
        >
          {submitting ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>

      {/* Product Selection Modal */}
      
      </div>
    </ProtectedRoute>
  );
}

