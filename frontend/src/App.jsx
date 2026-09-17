import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import CustomerModal from './components/CustomerModal';
import { productApi } from './api/productApi';
import { orderApi } from './api/orderApi';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'admin'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved customer info if previously used
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch product catalog & categories from MongoDB backend
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const prodsData = await productApi.getAll();
      setProducts(prodsData || []);

      const catsData = await productApi.getCategories();
      setCategories(catsData?.length ? catsData : ['Beverages', 'Bakery', 'Food', 'Snacks', 'Electronics', 'Accessories']);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Add product to cart directly with stock limit check
  const handleAddToCart = (product) => {
    const prodId = product._id || product.id;
    const availableStock = Number(product.stock) || 0;

    if (availableStock <= 0) {
      alert(`"${product.name}" is currently Stockout (0 units available).`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === prodId);
      if (existing) {
        if (existing.quantity >= availableStock) {
          alert(`Stockout limit reached! Only ${availableStock} unit(s) of "${product.name}" in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === prodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: prodId,
          productId: prodId,
          name: product.name,
          category: product.category || '',
          price: Number(product.price),
          quantity: 1,
          description: product.description || '',
          maxStock: availableStock,
        },
      ];
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }

    const matchedProduct = products.find((p) => (p._id || p.id) === id);
    const availableStock = matchedProduct ? Number(matchedProduct.stock) : 999;

    if (newQty > availableStock) {
      alert(`Stockout! Only ${availableStock} unit(s) available in stock.`);
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: availableStock } : item))
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => setCart([]);

  // Open checkout modal when clicking "Buy Now"
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutOpen(true);
  };

  // Confirm order and save to database
  const handleConfirmOrder = async (customerData) => {
    try {
      setIsProcessing(true);
      setCustomerInfo(customerData);

      try {
        localStorage.setItem('pos_customer', JSON.stringify(customerData));
      } catch {
        // Ignore storage error
      }

      const payload = {
        user: {
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
        },
        items: cart,
        paymentMethod: 'Cash / Card',
      };

      await orderApi.create(payload);
      setCart([]);
      setIsCheckoutOpen(false);
      await loadProducts();

      alert(`Purchase completed!\n\nCustomer: ${customerData.name}\nPhone: ${customerData.phone}\nDelivery Address: ${customerData.address}\n\nRecorded successfully in database.`);
    } catch (err) {
      alert(`Order submission failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main>
        {currentView === 'store' ? (
          <ShopPage
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOpenCheckout={handleOpenCheckout}
            loading={loading}
          />
        ) : (
          <AdminPage />
        )}
      </main>

      <CustomerModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirmOrder={handleConfirmOrder}
        cartTotal={cartTotal}
        cartItemsCount={cartItemsCount}
        isProcessing={isProcessing}
        initialData={customerInfo}
      />
    </div>
  );
}
