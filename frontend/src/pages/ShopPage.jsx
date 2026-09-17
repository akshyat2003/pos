import { useState } from 'react';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';

export default function ShopPage({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  loading,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="shop-layout">
      <div className="shop-main-column">
        {/* Search & Categories */}
        <div className="shop-toolbar">
          <div className="search-bar-wrap">
            <input
              type="text"
              placeholder="Search products by name or category..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <CategoryFilter
            categories={['All', ...categories]}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="loading-container">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-catalog">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Column */}
      <CartDrawer
        cart={cart}
        onUpdateQty={onUpdateQty}
        onRemoveItem={onRemoveItem}
        onClearCart={onClearCart}
        onOpenCheckout={onOpenCheckout}
      />
    </div>
  );
}
