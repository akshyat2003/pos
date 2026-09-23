import { fmtDate } from './adminUtils';
import { ProductFormFields } from './AdminModals';

const Actions = ({ onEdit, onDelete }) => (
  <div style={{ display: 'flex', gap: '0.4rem' }}>
    <button className="btn-action-edit" onClick={onEdit}>Edit</button>
    <button className="btn-action-delete" onClick={onDelete}>Delete</button>
  </div>
);

export function OrdersTab({ orders, onSelectOrder }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Recent Orders & Transactions</h3>
        <span className="admin-card-caption">All purchases stored in MongoDB with customer details and exact timestamp</span>
      </div>
      {!orders.length ? <div className="admin-empty">No orders found.</div> : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr><th>Timestamp</th><th>Customer</th><th>Phone</th><th>Address</th><th>Items</th><th>Total</th><th>Status</th><th>Details</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id || o.id}>
                  <td className="timestamp-col"><span className="badge-time">{fmtDate(o.createdAt)}</span></td>
                  <td><strong>{o.user?.name || 'Customer'}</strong></td>
                  <td className="phone-col">{o.user?.phone || '—'}</td>
                  <td className="address-col">{o.user?.address || '—'}</td>
                  <td>
                    <div className="items-list-compact">
                      {o.items?.map((item, i) => (
                        <span key={i} className="item-pill">{item.name} × <strong>{item.quantity}</strong> (${Number(item.price).toFixed(2)})</span>
                      ))}
                    </div>
                  </td>
                  <td className="price-col">${Number(o.totalAmount).toFixed(2)}</td>
                  <td><span className="badge-status-completed">{o.status || 'Completed'}</span></td>
                  <td><button className="btn-action-edit" onClick={() => onSelectOrder(o)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function InventoryTab({ products, search, onSearchChange, onEdit, onDelete, onAddNew }) {
  const filtered = products.filter((p) => [p.name, p.category].some((v) => v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div><h3>Product Inventory</h3><span className="admin-card-caption">Showing {filtered.length} of {products.length} products</span></div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input type="text" placeholder="Search products..." className="admin-search-input" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          <button className="btn-admin-submit" style={{ margin: 0, padding: '0.5rem 1rem' }} onClick={onAddNew}>+ Add New</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id || p.id}>
                <td style={{ width: '48px', padding: '0.4rem' }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="admin-prod-thumb" /> : <div className="admin-prod-thumb-placeholder">📦</div>}
                </td>
                <td><strong>{p.name}</strong></td>
                <td><span className="cat-badge">{p.category}</span></td>
                <td className="price-col">${Number(p.price).toFixed(2)}</td>
                <td><span className={`stock-badge ${Number(p.stock) <= 0 ? 'low' : ''}`}>{Math.max(0, Number(p.stock) || 0)} units</span></td>
                <td className="desc-col">{p.description || '—'}</td>
                <td><Actions onEdit={() => onEdit({ ...p })} onDelete={() => onDelete(p)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AddProductTab({ newProd, setNewProd, onSubmit, submitting }) {
  return (
    <div className="admin-card max-form-width">
      <div className="admin-card-header"><h3>Add New Product</h3><span className="admin-card-caption">Instantly adds item to catalog</span></div>
      <form onSubmit={(e) => onSubmit(e, newProd, false)} className="admin-form">
        <ProductFormFields value={newProd} onChange={setNewProd} />
        <button type="submit" className="btn-admin-submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
      </form>
    </div>
  );
}

export function UsersTab({ users, search, onSearchChange, onEdit, onDelete }) {
  const filtered = users.filter((u) => [u.name, u.phone, u.address, u.email].some((v) => v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div><h3>Customers</h3><span className="admin-card-caption">Total: {filtered.length} Users</span></div>
        <input type="text" placeholder="Search customers..." className="admin-search-input" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      {!filtered.length ? <div className="admin-empty">No users found.</div> : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Address</th><th>Email</th><th>Registered</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id || u.id || i}>
                  <td>{i + 1}</td><td><strong>{u.name}</strong></td><td>{u.phone || '—'}</td><td>{u.address || '—'}</td><td>{u.email || '—'}</td><td>{fmtDate(u.createdAt)}</td>
                  <td><Actions onEdit={() => onEdit({ ...u })} onDelete={() => onDelete(u)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function SessionsTab({ sessions, loading, onRefresh, onRevoke }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div><h3>Active Login Sessions</h3><span className="admin-card-caption">Real-time sessions stored in MongoDB with JWT & HTTP-Only cookies</span></div>
        <button className="btn-admin-refresh" onClick={onRefresh} disabled={loading}>{loading ? '...' : 'Refresh'}</button>
      </div>
      {!sessions.length ? <div className="admin-empty">No active sessions found.</div> : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>User / Admin</th><th>Email</th><th>Role</th><th>IP Address</th><th>Device Info</th><th>Logged In</th><th>Actions</th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.userName || 'User'}</strong></td><td>{s.userEmail}</td>
                  <td><span className={s.role === 'admin' ? 'cat-badge' : 'item-pill'}>{s.role.toUpperCase()}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.ipAddress}</td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }} title={s.userAgent}>{s.userAgent}</td>
                  <td><span className="badge-time">{fmtDate(s.createdAt)}</span></td>
                  <td><button className="btn-action-delete" onClick={() => onRevoke(s._id, s.userEmail)}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
