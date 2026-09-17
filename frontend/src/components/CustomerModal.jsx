import { useState } from 'react';

export default function CustomerModal({
  isOpen,
  onClose,
  onConfirmOrder,
  cartTotal,
  cartItemsCount,
  isProcessing,
  initialData
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in your Name, Phone Number, and Address.');
      return;
    }
    onConfirmOrder({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Complete Purchase</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-summary-box">
          <div className="summary-item">
            <span>Items:</span>
            <strong>{cartItemsCount} products</strong>
          </div>
          <div className="summary-item">
            <span>Total Payable:</span>
            <strong className="summary-total-price">${cartTotal.toFixed(2)}</strong>
          </div>
        </div>

        <p className="modal-sub">Enter your details to confirm the purchase:</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +1 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea
              rows="3"
              placeholder="e.g. Flat 4B, 123 Market Street, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isProcessing}>
              {isProcessing ? 'Processing Order...' : `Confirm & Buy ($${cartTotal.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
