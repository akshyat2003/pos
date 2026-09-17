import { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import { statsApi } from '../api/statsApi';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'add-product' | 'users'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Beverages');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodDesc, setProdDesc] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('Beverages');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');



  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');

  // Inventory Search Filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, prodsData, usersData] = await Promise.all([
        statsApi.getStats().catch(() => null),
        orderApi.getAll().catch(() => []),
        productApi.getAll().catch(() => []),
        userApi.getAll().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setOrders(ordersData || []);
      setProducts(prodsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Failed loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // --- PRODUCT CRUD ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodCategory || !prodPrice) {
      alert('Please fill in product name, category, and price.');
      return;
    }

    try {
      setIsSubmittingProd(true);
      await productApi.create({
        name: prodName.trim(),
        category: prodCategory,
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock) || 50,
        description: prodDesc.trim(),
      });

      setProdName('');
      setProdPrice('');
      setProdDesc('');
      alert(`Product "${prodName}" added successfully to MongoDB!`);
      await loadAdminData();
      setActiveTab('inventory');
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    } finally {
      setIsSubmittingProd(false);
    }
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditProdName(product.name);
    setEditProdCategory(product.category);
    setEditProdPrice(product.price.toString());
    setEditProdStock(product.stock.toString());
    setEditProdDesc(product.description || '');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await productApi.update(editingProduct._id || editingProduct.id, {
        name: editProdName.trim(),
        category: editProdCategory,
        price: parseFloat(editProdPrice),
        stock: parseInt(editProdStock) || 0,
        description: editProdDesc.trim(),
      });

      setEditingProduct(null);
      alert('Product updated successfully in MongoDB!');
      await loadAdminData();
    } catch (err) {
      alert(`Failed to update product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      await productApi.delete(id);
      await loadAdminData();
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  // --- USER EDIT & DELETE ONLY ---

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setEditUserName(u.name || '');
    setEditUserPhone(u.phone || '');
    setEditUserAddress(u.address || '');
    setEditUserEmail(u.email || '');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await userApi.update(editingUser._id || editingUser.id, {
        name: editUserName.trim(),
        phone: editUserPhone.trim(),
        address: editUserAddress.trim(),
        email: editUserEmail.trim(),
      });

      setEditingUser(null);
      alert('Customer updated successfully in MongoDB!');
      await loadAdminData();
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}" from the database?`)) return;
    try {
      await userApi.delete(id);
      await loadAdminData();
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredInventory = products.filter((p) =>
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.phone && u.phone.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.address && u.address.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header-bar">
        <div>
          <h2>Admin Control Panel</h2>
          <p className="admin-subtitle">Manage products, customer records, inventory, and timestamped transactions.</p>
        </div>
        <button className="btn-admin-refresh" onClick={loadAdminData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-number">{stats?.counts?.users ?? users.length}</span>
          <span className="stat-desc">Registered customers in database</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-number">{stats?.counts?.products ?? products.length}</span>
          <span className="stat-desc">Active catalog items</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-number">{stats?.counts?.orders ?? orders.length}</span>
          <span className="stat-desc">Timestamped transactions</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-number">${(stats?.counts?.totalSales || 0).toFixed(2)}</span>
          <span className="stat-desc">{stats?.counts?.totalItemsSold || 0} items purchased</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders & Timestamps ({orders.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Products & Inventory ({products.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          + Add Product
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Customers & Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Orders & Timestamps */}
      {activeTab === 'orders' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Orders & Transactions</h3>
            <span className="admin-card-caption">All purchases stored in MongoDB with customer details and exact timestamp</span>
          </div>

          {orders.length === 0 ? (
            <div className="admin-empty">No orders found in the database yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Delivery Address</th>
                    <th>Items Purchased</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id || order.id}>
                      <td className="timestamp-col">
                        <span className="badge-time">{formatDate(order.createdAt)}</span>
                      </td>
                      <td>
                        <strong>{order.user?.name || 'Customer'}</strong>
                      </td>
                      <td className="phone-col">{order.user?.phone || '—'}</td>
                      <td className="address-col">{order.user?.address || '—'}</td>
                      <td>
                        <div className="items-list-compact">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="item-pill">
                              {item.name} × <strong>{item.quantity}</strong> (${item.price?.toFixed(2)})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="price-col">${Number(order.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className="badge-status-completed">{order.status || 'Completed'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Products & Inventory (View, Edit, Delete) */}
      {activeTab === 'inventory' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Product Inventory Catalog</h3>
              <span className="admin-card-caption">Showing {filteredInventory.length} of {products.length} products</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by product name or category..."
                className="admin-search-input"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
              <button className="btn-admin-submit" style={{ margin: 0, padding: '0.5rem 1rem' }} onClick={() => setActiveTab('add-product')}>
                + Add New
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((p) => (
                  <tr key={p._id || p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="cat-badge">{p.category}</span></td>
                    <td className="price-col">${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${Number(p.stock) <= 0 ? 'low' : Number(p.stock) < 10 ? 'low' : ''}`}>
                        {Math.max(0, Number(p.stock) || 0)} units {Number(p.stock) <= 0 ? '(Stockout)' : ''}
                      </span>
                    </td>
                    <td className="desc-col">{p.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-action-edit"
                          onClick={() => openEditProductModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action-delete"
                          onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Product Form */}
      {activeTab === 'add-product' && (
        <div className="admin-card max-form-width">
          <div className="admin-card-header">
            <h3>Add New Product to Database</h3>
            <span className="admin-card-caption">Instantly adds the item to MongoDB and the live catalog</span>
          </div>

          <form onSubmit={handleAddProduct} className="admin-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g. Vanilla Nitro Cold Brew"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
              >
                <option value="Beverages">Beverages</option>
                <option value="Bakery">Bakery</option>
                <option value="Food">Food</option>
                <option value="Snacks">Snacks</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5.50"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Description</label>
              <textarea
                rows="3"
                placeholder="Brief description of the product"
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-admin-submit" disabled={isSubmittingProd}>
              {isSubmittingProd ? 'Saving to Database...' : 'Save Product to MongoDB'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Customers & Users (View, Add, Edit, Delete) */}
      {activeTab === 'users' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Customer & User Database</h3>
              <span className="admin-card-caption">Total: {filteredUsers.length} Users</span>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search customers..."
                className="admin-search-input"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="admin-empty">No registered users found.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Email</th>
                    <th>Date Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr key={u._id || u.id || idx}>
                      <td>{idx + 1}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.address || '—'}</td>
                      <td>{u.email || '—'}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn-action-edit"
                            onClick={() => openEditUserModal(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteUser(u._id || u.id, u.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="btn-close" onClick={() => setEditingProduct(null)}>✕</button>
            </div>

            <form onSubmit={handleUpdateProduct} className="modal-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={editProdCategory}
                  onChange={(e) => setEditProdCategory(e.target.value)}
                >
                  <option value="Beverages">Beverages</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Food">Food</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Customer Details</h3>
              <button className="btn-close" onClick={() => setEditingUser(null)}>✕</button>
            </div>

            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editUserPhone}
                  onChange={(e) => setEditUserPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  rows="2"
                  value={editUserAddress}
                  onChange={(e) => setEditUserAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
