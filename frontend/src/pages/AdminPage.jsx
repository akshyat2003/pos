import { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import { statsApi } from '../api/statsApi';
import { authApi } from '../api/authApi';
import { EditProductModal, EditUserModal, OrderDetailsModal } from '../components/admin/AdminModals';
import { OrdersTab, InventoryTab, AddProductTab, UsersTab, SessionsTab } from '../components/admin/AdminTabs';

const INIT_PROD = { name: '', category: '', price: '', stock: '', description: '', imageUrl: '' };

export default function AdminPage({ onProductsUpdated }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState({ stats: null, orders: [], products: [], users: [], sessions: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newProd, setNewProd] = useState(INIT_PROD);
  const [editProduct, setEditProduct] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState({ inv: '', user: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, orders, products, users, sessions] = await Promise.all([
        statsApi.getStats().catch(() => null),
        orderApi.getAll().catch(() => []),
        productApi.getAll().catch(() => []),
        userApi.getAll().catch(() => []),
        authApi.getSessions().catch(() => []),
      ]);
      setData({ stats, orders: orders || [], products: products || [], users: users || [], sessions: sessions || [] });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const saveProduct = async (e, p, isEdit) => {
    e.preventDefault();
    if (!p.name?.trim() || !p.category?.trim() || !p.price) return alert('Name, category, and price are required.');
    try {
      if (!isEdit) setSubmitting(true);
      const payload = { ...p, price: parseFloat(p.price), stock: parseInt(p.stock) || 0, imageUrl: p.imageUrl || '' };
      if (isEdit) await productApi.update(p._id, payload);
      else await productApi.create(payload);
      alert(`Product ${isEdit ? 'updated' : 'added'} successfully!`);
      if (isEdit) setEditProduct(null);
      else { setNewProd(INIT_PROD); setActiveTab('inventory'); }
      await loadData();
      onProductsUpdated?.();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const remove = async (fn, id, name, type) => {
    if (window.confirm(`Delete ${type} "${name}"?`)) {
      try { await fn(id); await loadData(); onProductsUpdated?.(); } catch (err) { alert(err.message); }
    }
  };

  const handleRevokeSession = async (id, email) => {
    if (!window.confirm(`Revoke session for ${email}? This device will be logged out immediately.`)) return;
    try { await authApi.revokeSession(id); alert('Session revoked.'); await loadData(); } catch (err) { alert(err.message); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.update(editUser._id, editUser);
      setEditUser(null);
      alert('Customer updated successfully!');
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const { stats, orders, products, users, sessions } = data;

  return (
    <div className="admin-container">
      <div className="admin-header-bar">
        <div><h2>Admin Control Panel</h2><p className="admin-subtitle">Manage products, customers, inventory, timestamped orders, and live sessions.</p></div>
        <button className="btn-admin-refresh" onClick={loadData} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh Data'}</button>
      </div>

      <div className="admin-metrics-grid">
        {[
          ['Total Users', stats?.counts?.users ?? users.length, 'Registered customers in database'],
          ['Total Products', stats?.counts?.products ?? products.length, 'Active catalog items'],
          ['Total Orders', stats?.counts?.orders ?? orders.length, 'Timestamped transactions'],
          ['Active Sessions', sessions.length, 'Live authenticated devices in MongoDB'],
        ].map(([lbl, count, desc]) => (
          <div key={lbl} className="admin-stat-card"><span className="stat-label">{lbl}</span><span className="stat-number">{count}</span><span className="stat-desc">{desc}</span></div>
        ))}
      </div>

      <div className="admin-nav-tabs">
        {[
          ['orders', `Orders (${orders.length})`],
          ['inventory', `Inventory (${products.length})`],
          ['add-product', '+ Add Product'],
          ['users', `Users (${users.length})`],
          ['sessions', `Active Sessions (${sessions.length})`],
        ].map(([k, lbl]) => (
          <button key={k} className={`admin-tab-btn ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{lbl}</button>
        ))}
      </div>

      {activeTab === 'orders' && <OrdersTab orders={orders} onSelectOrder={setSelectedOrder} />}
      {activeTab === 'inventory' && (
        <InventoryTab
          products={products}
          search={search.inv}
          onSearchChange={(inv) => setSearch({ ...search, inv })}
          onEdit={(p) => setEditProduct({ ...p })}
          onDelete={(p) => remove(productApi.delete, p._id || p.id, p.name, 'product')}
          onAddNew={() => setActiveTab('add-product')}
        />
      )}
      {activeTab === 'add-product' && <AddProductTab newProd={newProd} setNewProd={setNewProd} onSubmit={saveProduct} submitting={submitting} />}
      {activeTab === 'users' && (
        <UsersTab
          users={users}
          search={search.user}
          onSearchChange={(user) => setSearch({ ...search, user })}
          onEdit={(u) => setEditUser({ ...u })}
          onDelete={(u) => remove(userApi.delete, u._id || u.id, u.name, 'user')}
        />
      )}
      {activeTab === 'sessions' && <SessionsTab sessions={sessions} loading={loading} onRefresh={loadData} onRevoke={handleRevokeSession} />}

      <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onSave={saveProduct} onChange={setEditProduct} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleUpdateUser} onChange={setEditUser} />
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
