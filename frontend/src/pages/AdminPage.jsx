import { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import { statsApi } from '../api/statsApi';
import { authApi } from '../api/authApi';

const CATEGORIES = ['Beverages', 'Bakery', 'Food', 'Snacks', 'Electronics', 'Accessories'];
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProd, setNewProd] = useState({ name: '', category: 'Beverages', price: '', stock: '50', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState({ inv: '', user: '' });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, o, p, u, ses] = await Promise.all([
        statsApi.getStats().catch(() => null),
        orderApi.getAll().catch(() => []),
        productApi.getAll().catch(() => []),
        userApi.getAll().catch(() => []),
        authApi.getSessions().catch(() => []),
      ]);
      if (s) setStats(s);
      setOrders(o || []); setProducts(p || []); setUsers(u || []); setSessions(ses || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAdminData(); }, []);

  const saveProduct = async (e, p, isEdit) => {
    e.preventDefault();
    if (!p.name?.trim() || !p.price) return alert('Name and price are required.');
    try {
      if (!isEdit) setSubmitting(true);
      const data = { ...p, price: parseFloat(p.price), stock: parseInt(p.stock) || 0 };
      isEdit ? await productApi.update(p._id, data) : await productApi.create(data);
      alert(`Product ${isEdit ? 'updated' : 'added'} successfully!`);
      if (isEdit) setEditProduct(null);
      else { setNewProd({ name: '', category: 'Beverages', price: '', stock: '50', description: '' }); setActiveTab('inventory'); }
      await loadAdminData();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const remove = async (fn, id, name, type) => {
    if (window.confirm(`Delete ${type} "${name}"?`)) {
      try { await fn(id); await loadAdminData(); } catch (err) { alert(err.message); }
    }
  };

  const handleRevokeSession = async (id, email) => {
    if (!window.confirm(`Revoke session for ${email}? This device will be logged out immediately.`)) return;
    try {
      await authApi.revokeSession(id);
      alert('Session revoked.');
      await loadAdminData();
    } catch (err) { alert(err.message); }
  };

  const filteredInv = products.filter(p => p.name.toLowerCase().includes(search.inv.toLowerCase()) || p.category.toLowerCase().includes(search.inv.toLowerCase()));
  const filteredUsers = users.filter(u => [u.name, u.phone, u.address].some(v => v?.toLowerCase().includes(search.user.toLowerCase())));

  const renderProductInputs = (val, setVal) => (
    <>
      <div className="form-group"><label>Product Name</label><input type="text" value={val.name} onChange={e => setVal({ ...val, name: e.target.value })} required /></div>
      <div className="form-group"><label>Category</label><select value={val.category} onChange={e => setVal({ ...val, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      <div className="form-row-2">
        <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" min="0" value={val.price} onChange={e => setVal({ ...val, price: e.target.value })} required /></div>
        <div className="form-group"><label>Stock</label><input type="number" min="0" value={val.stock} onChange={e => setVal({ ...val, stock: e.target.value })} /></div>
      </div>
      <div className="form-group"><label>Description</label><textarea rows="2" value={val.description || ''} onChange={e => setVal({ ...val, description: e.target.value })} /></div>
    </>
  );

  return (
    <div className="admin-container">
      <div className="admin-header-bar">
        <div><h2>Admin Control Panel</h2><p className="admin-subtitle">Manage products, customers, inventory, timestamped orders, and live sessions.</p></div>
        <button className="btn-admin-refresh" onClick={loadAdminData} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh Data'}</button>
      </div>

      <div className="admin-metrics-grid">
        {[
          ['Total Users', stats?.counts?.users ?? users.length, 'Registered customers in database'],
          ['Total Products', stats?.counts?.products ?? products.length, 'Active catalog items'],
          ['Total Orders', stats?.counts?.orders ?? orders.length, 'Timestamped transactions'],
          ['Active Sessions', sessions.length, 'Live authenticated devices in MongoDB']
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
          ['sessions', `Active Sessions (${sessions.length})`]
        ].map(([k, lbl]) => (
          <button key={k} className={`admin-tab-btn ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{lbl}</button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="admin-card">
          <div className="admin-card-header"><h3>Recent Orders & Transactions</h3><span className="admin-card-caption">All purchases stored in MongoDB with customer details and exact timestamp</span></div>
          {!orders.length ? <div className="admin-empty">No orders found.</div> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Timestamp</th><th>Customer</th><th>Phone</th><th>Address</th><th>Items</th><th>Total</th><th>Status</th><th>Details</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id || o.id}>
                      <td className="timestamp-col"><span className="badge-time">{fmtDate(o.createdAt)}</span></td>
                      <td><strong>{o.user?.name || 'Customer'}</strong></td>
                      <td className="phone-col">{o.user?.phone || '—'}</td>
                      <td className="address-col">{o.user?.address || '—'}</td>
                      <td><div className="items-list-compact">{o.items?.map((item, i) => <span key={i} className="item-pill">{item.name} × <strong>{item.quantity}</strong> (${Number(item.price).toFixed(2)})</span>)}</div></td>
                      <td className="price-col">${Number(o.totalAmount).toFixed(2)}</td>
                      <td><span className="badge-status-completed">{o.status || 'Completed'}</span></td>
                      <td><button className="btn-action-edit" onClick={() => setSelectedOrder(o)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div><h3>Product Inventory</h3><span className="admin-card-caption">Showing {filteredInv.length} of {products.length} products</span></div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="text" placeholder="Search products..." className="admin-search-input" value={search.inv} onChange={e => setSearch({ ...search, inv: e.target.value })} />
              <button className="btn-admin-submit" style={{ margin: 0, padding: '0.5rem 1rem' }} onClick={() => setActiveTab('add-product')}>+ Add New</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredInv.map(p => (
                  <tr key={p._id || p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="cat-badge">{p.category}</span></td>
                    <td className="price-col">${Number(p.price).toFixed(2)}</td>
                    <td><span className={`stock-badge ${Number(p.stock) <= 0 ? 'low' : ''}`}>{Math.max(0, Number(p.stock) || 0)} units</span></td>
                    <td className="desc-col">{p.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-action-edit" onClick={() => setEditProduct({ ...p })}>Edit</button>
                        <button className="btn-action-delete" onClick={() => remove(productApi.delete, p._id || p.id, p.name, 'product')}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'add-product' && (
        <div className="admin-card max-form-width">
          <div className="admin-card-header"><h3>Add New Product</h3><span className="admin-card-caption">Instantly adds item to catalog</span></div>
          <form onSubmit={e => saveProduct(e, newProd, false)} className="admin-form">
            {renderProductInputs(newProd, setNewProd)}
            <button type="submit" className="btn-admin-submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div><h3>Customers</h3><span className="admin-card-caption">Total: {filteredUsers.length} Users</span></div>
            <input type="text" placeholder="Search customers..." className="admin-search-input" value={search.user} onChange={e => setSearch({ ...search, user: e.target.value })} />
          </div>
          {!filteredUsers.length ? <div className="admin-empty">No users found.</div> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Address</th><th>Email</th><th>Registered</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u._id || u.id || i}>
                      <td>{i + 1}</td><td><strong>{u.name}</strong></td><td>{u.phone || '—'}</td><td>{u.address || '—'}</td><td>{u.email || '—'}</td><td>{fmtDate(u.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn-action-edit" onClick={() => setEditUser({ ...u })}>Edit</button>
                          <button className="btn-action-delete" onClick={() => remove(userApi.delete, u._id || u.id, u.name, 'user')}>Delete</button>
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

      {activeTab === 'sessions' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div><h3>Active Login Sessions</h3><span className="admin-card-caption">Real-time sessions stored in MongoDB with JWT & HTTP-Only cookies</span></div>
            <button className="btn-admin-refresh" onClick={loadAdminData} disabled={loading}>{loading ? '...' : 'Refresh'}</button>
          </div>
          {!sessions.length ? <div className="admin-empty">No active sessions found.</div> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>User / Admin</th><th>Email</th><th>Role</th><th>IP Address</th><th>Device Info</th><th>Logged In</th><th>Actions</th></tr></thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s._id}>
                      <td><strong>{s.userName || 'User'}</strong></td>
                      <td>{s.userEmail}</td>
                      <td><span className={s.role === 'admin' ? 'cat-badge' : 'item-pill'}>{s.role.toUpperCase()}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.ipAddress}</td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }} title={s.userAgent}>{s.userAgent}</td>
                      <td><span className="badge-time">{fmtDate(s.createdAt)}</span></td>
                      <td><button className="btn-action-delete" onClick={() => handleRevokeSession(s._id, s.userEmail)}>Revoke</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Product</h3><button className="btn-close" onClick={() => setEditProduct(null)}>✕</button></div>
            <form onSubmit={e => saveProduct(e, editProduct, true)} className="modal-form">
              {renderProductInputs(editProduct, setEditProduct)}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Customer</h3><button className="btn-close" onClick={() => setEditUser(null)}>✕</button></div>
            <form onSubmit={async e => {
              e.preventDefault();
              try { await userApi.update(editUser._id, editUser); setEditUser(null); alert('Customer updated successfully!'); await loadAdminData(); } catch (err) { alert(err.message); }
            }} className="modal-form">
              <div className="form-group"><label>Full Name</label><input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required /></div>
              <div className="form-group"><label>Phone</label><input type="tel" value={editUser.phone || ''} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} required /></div>
              <div className="form-group"><label>Address</label><textarea rows="2" value={editUser.address || ''} onChange={e => setEditUser({ ...editUser, address: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={editUser.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h3 style={{ margin: 0 }}>Order Details</h3><span style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {selectedOrder._id || selectedOrder.id}</span></div>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{selectedOrder.user?.name || 'Customer'}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>Phone: {selectedOrder.user?.phone || '—'}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>Address: {selectedOrder.user?.address || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Transaction</div>
                <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.25rem' }}><strong>Timestamp:</strong> {fmtDate(selectedOrder.createdAt)}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Status:</strong> <span className="badge-status-completed">{selectedOrder.status || 'Completed'}</span></div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Payment:</strong> {selectedOrder.paymentMethod || 'Cash / Card'}</div>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Products Purchased</h4>
              <div className="table-responsive">
                <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                  <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {selectedOrder.items?.map((item, i) => (
                      <tr key={i}>
                        <td><strong>{item.name}</strong></td>
                        <td><span className="cat-badge">{item.category || 'Standard'}</span></td>
                        <td>${Number(item.price).toFixed(2)}</td><td>{item.quantity}</td>
                        <td className="price-col">${Number(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Total:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>${Number(selectedOrder.totalAmount).toFixed(2)}</span>
            </div>
            <button type="button" className="btn-admin-refresh" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setSelectedOrder(null)}>Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
}
