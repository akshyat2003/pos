import { useState, useEffect } from 'react';

export default function CustomerModal({ isOpen, onClose, onConfirmOrder, cartTotal, cartItemsCount, isProcessing, initialData }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (isOpen) setForm({ name: initialData?.name || '', phone: initialData?.phone || '', address: initialData?.address || '' });
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return alert('Please fill in Name, Phone, and Address.');
    onConfirmOrder(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Complete Purchase</h3><button className="btn-close" onClick={onClose}>✕</button></div>
        <div className="checkout-summary-box">
          <div className="summary-item"><span>Items:</span><strong>{cartItemsCount} products</strong></div>
          <div className="summary-item"><span>Total Payable:</span><strong className="summary-total-price">${cartTotal.toFixed(2)}</strong></div>
        </div>
        <p className="modal-sub">Enter your details to confirm the purchase:</p>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group"><label>Full Name</label><input type="text" placeholder="e.g. John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus /></div>
          <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="e.g. +1 555-0199" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
          <div className="form-group"><label>Delivery Address</label><textarea rows="3" placeholder="e.g. Flat 4B, 123 Market Street" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isProcessing}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isProcessing}>{isProcessing ? 'Processing Order...' : `Confirm & Buy ($${cartTotal.toFixed(2)})`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
