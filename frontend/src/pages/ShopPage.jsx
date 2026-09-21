import { useState } from 'react';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';

export default function ShopPage({
  products, categories, selectedCategory, setSelectedCategory,
  cart, onAddToCart, onUpdateQty, onRemoveItem, onClearCart, onOpenCheckout,
  loading, currentUser
}) {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();
  const filtered = products.filter(p =>
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );

  return (
    <div className="shop-layout">
      <div className="shop-main-column">
        {currentUser && <div className="shop-user-banner"><span>👋 Welcome, <strong>{currentUser.name}</strong>! Browse products below and place your order.</span></div>}
        <div className="shop-toolbar">
          <div className="search-bar-wrap">
            <input type="text" placeholder="Search products by name or category..." className="search-input" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <CategoryFilter categories={['All', ...categories]} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        {loading ? <div className="loading-container">Loading products...</div> : !filtered.length ? (
          <div className="empty-catalog"><p>No products found in this category.</p></div>
        ) : (
          <div className="products-grid">{filtered.map(p => <ProductCard key={p._id || p.id} product={p} onAddToCart={onAddToCart} />)}</div>
        )}
      </div>
      <CartDrawer cart={cart} onUpdateQty={onUpdateQty} onRemoveItem={onRemoveItem} onClearCart={onClearCart} onOpenCheckout={onOpenCheckout} />
    </div>
  );
}
