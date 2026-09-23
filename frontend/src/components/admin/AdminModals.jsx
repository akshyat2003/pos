import { useState } from 'react';
import { fmtDate } from './adminUtils';
import { productApi } from '../../api/productApi';

export function Modal({ title, subtitle, onClose, maxWidth, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={maxWidth ? { maxWidth } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div><h3 style={{ margin: 0 }}>{title}</h3>{subtitle && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</span>}</div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProductFormFields({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const up = (k, v) => onChange({ ...value, [k]: v });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select a valid image file (PNG, JPG, WEBP).');
    if (file.size > 5 * 1024 * 1024) return alert('Image size must be under 5MB.');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploading(true);
        const res = await productApi.uploadImage(reader.result, file.name);
        up('imageUrl', res.url);
      } catch (err) { alert(`Failed to upload to ImageKit: ${err.message}`); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="form-group"><label>Product Name</label><input type="text" placeholder="Enter product name" value={value.name || ''} onChange={(e) => up('name', e.target.value)} required /></div>
      <div className="form-group"><label>Category</label><input type="text" placeholder="Enter category" value={value.category || ''} onChange={(e) => up('category', e.target.value)} required /></div>
      <div className="form-row-2">
        <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" min="0" placeholder="0.00" value={value.price ?? ''} onChange={(e) => up('price', e.target.value)} required /></div>
        <div className="form-group"><label>Stock</label><input type="number" min="0" placeholder="0" value={value.stock ?? ''} onChange={(e) => up('stock', e.target.value)} /></div>
      </div>
      <div className="form-group">
        <label>Product Image (ImageKit.io)</label>
        <div className="image-upload-control">
          {value.imageUrl ? (
            <div className="image-preview-card">
              <img src={value.imageUrl} alt="Product preview" className="image-preview-thumb" />
              <div className="image-preview-info">
                <span className="badge-imagekit">✓ ImageKit Hosted</span>
                <input type="text" className="image-url-input" value={value.imageUrl} onChange={(e) => up('imageUrl', e.target.value)} placeholder="https://ik.imagekit.io/..." />
                <button type="button" className="btn-remove-image" onClick={() => up('imageUrl', '')}>✕ Remove Image</button>
              </div>
            </div>
          ) : (
            <div className="image-drop-area">
              <input type="file" id={`file-input-${value._id || 'new'}`} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
              <label htmlFor={`file-input-${value._id || 'new'}`} className="btn-file-select">{uploading ? '⏳ Uploading to ImageKit...' : '📁 Choose Image File'}</label>
              <span className="image-or-text">or paste image URL:</span>
              <input type="url" placeholder="https://..." value={value.imageUrl || ''} onChange={(e) => up('imageUrl', e.target.value)} className="image-url-input" />
            </div>
          )}
        </div>
      </div>
      <div className="form-group"><label>Description</label><textarea rows="2" placeholder="Optional description" value={value.description || ''} onChange={(e) => up('description', e.target.value)} /></div>
    </>
  );
}

export function EditProductModal({ product, onClose, onSave, onChange }) {
  if (!product) return null;
  return (
    <Modal title="Edit Product" onClose={onClose}>
      <form onSubmit={(e) => onSave(e, product, true)} className="modal-form">
        <ProductFormFields value={product} onChange={onChange} />
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </Modal>
  );
}

export function EditUserModal({ user, onClose, onSave, onChange }) {
  if (!user) return null;
  const up = (k, v) => onChange({ ...user, [k]: v });
  return (
    <Modal title="Edit Customer" onClose={onClose}>
      <form onSubmit={onSave} className="modal-form">
        <div className="form-group"><label>Full Name</label><input type="text" value={user.name || ''} onChange={(e) => up('name', e.target.value)} required /></div>
        <div className="form-group"><label>Phone</label><input type="tel" value={user.phone || ''} onChange={(e) => up('phone', e.target.value)} required /></div>
        <div className="form-group"><label>Address</label><textarea rows="2" value={user.address || ''} onChange={(e) => up('address', e.target.value)} required /></div>
        <div className="form-group"><label>Email</label><input type="email" value={user.email || ''} onChange={(e) => up('email', e.target.value)} /></div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Update Customer</button>
        </div>
      </form>
    </Modal>
  );
}

export function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;
  return (
    <Modal title="Order Details" subtitle={`ID: ${order._id || order.id}`} onClose={onClose} maxWidth="640px">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Customer</div>
          <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{order.user?.name || 'Customer'}</div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>Phone: {order.user?.phone || '—'}</div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>Address: {order.user?.address || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Transaction</div>
          <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.25rem' }}><strong>Timestamp:</strong> {fmtDate(order.createdAt)}</div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Status:</strong> <span className="badge-status-completed">{order.status || 'Completed'}</span></div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Payment:</strong> {order.paymentMethod || 'Cash / Card'}</div>
        </div>
      </div>
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Products Purchased</h4>
        <div className="table-responsive">
          <table className="admin-table" style={{ fontSize: '0.85rem' }}>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="cat-badge">{item.category || 'Standard'}</span></td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td className="price-col">${Number(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
        <span style={{ fontWeight: 600, color: '#475569' }}>Total:</span>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>${Number(order.totalAmount).toFixed(2)}</span>
      </div>
      <button type="button" className="btn-admin-refresh" style={{ width: '100%', marginTop: '0.5rem' }} onClick={onClose}>Close Details</button>
    </Modal>
  );
}
