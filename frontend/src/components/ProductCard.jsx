export default function ProductCard({ product, onAddToCart }) {
  const isStockout = !product.stock || product.stock <= 0;

  return (
    <div className={`product-card ${isStockout ? 'is-stockout' : ''}`}>
      <div className="product-card-top">
        <span className="product-category-tag">{product.category}</span>
        <span className={`product-stock-tag ${isStockout ? 'stockout' : ''}`}>
          {isStockout ? 'Stockout (0 in stock)' : `${product.stock} in stock`}
        </span>
      </div>

      <h3 className="product-title">{product.name}</h3>
      {product.description && <p className="product-desc">{product.description}</p>}

      <div className="product-card-bottom">
        <div className="product-price">${Number(product.price).toFixed(2)}</div>
        <button
          className="btn-add-cart"
          onClick={() => onAddToCart(product)}
          disabled={isStockout}
        >
          {isStockout ? 'Stockout' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
