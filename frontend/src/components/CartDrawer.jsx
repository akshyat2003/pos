export default function CartDrawer({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <aside className="cart-sidebar">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <span className="cart-badge">{totalItems} items</span>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <p>Your cart is empty</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Select products from the catalog to add.
          </span>
        </div>
      ) : (
        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-row">
              <div className="cart-item-details">
                <span className="cart-item-name">{item.name}</span>
                <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>

              <div className="cart-item-actions">
                <div className="qty-controls">
                  <button
                    className="btn-qty"
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-number">{item.quantity}</span>
                  <button
                    className="btn-qty"
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn-remove"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-footer">
        <div className="cart-subtotal-row">
          <span>Subtotal</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className="cart-total-row">
          <span>Total</span>
          <span className="cart-total-price">${totalAmount.toFixed(2)}</span>
        </div>

        <button
          className="btn-checkout-primary"
          onClick={onOpenCheckout}
          disabled={cart.length === 0}
        >
          Buy Now (${totalAmount.toFixed(2)})
        </button>

        {cart.length > 0 && (
          <button className="btn-clear-cart" onClick={onClearCart}>
            Clear Cart
          </button>
        )}
      </div>
    </aside>
  );
}
