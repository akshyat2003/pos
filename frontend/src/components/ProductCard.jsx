export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-card-top">
        <span className="product-category-tag">{product.category}</span>
        <span className="product-stock-tag">{product.stock} in stock</span>
      </div>

      <h3 className="product-title">{product.name}</h3>
      {product.description && <p className="product-desc">{product.description}</p>}

      <div className="product-card-bottom">
        <div className="product-price">${Number(product.price).toFixed(2)}</div>
        <button
          className="btn-add-cart"
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? '+ Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
