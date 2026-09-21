import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import UserAuthPage from './pages/UserAuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CustomerModal from './components/CustomerModal';
import { productApi } from './api/productApi';
import { orderApi } from './api/orderApi';
import { authApi } from './api/authApi';
import './App.css';

const getStored = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };

export default function App() {
  const [currentView, setCurrentView] = useState('store');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => getStored('pos_user'));
  const [adminUser, setAdminUser] = useState(() => getStored('pos_admin'));
  const [customerInfo, setCustomerInfo] = useState(() => {
    const u = getStored('pos_user');
    return u ? { name: u.name || '', phone: u.phone || '', address: u.address || '' } : getStored('pos_customer');
  });

  // Verify active JWT cookie + MongoDB session on load
  useEffect(() => {
    authApi.getMe()
      .then(res => {
        if (res.user?.role === 'admin') setAdminUser(res.user);
        else {
          setCurrentUser(res.user);
          setCustomerInfo({ name: res.user.name || '', phone: res.user.phone || '', address: res.user.address || '' });
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setAdminUser(null);
        localStorage.removeItem('pos_user');
        localStorage.removeItem('pos_admin');
      });
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([productApi.getAll(), productApi.getCategories()]);
      setProducts(p || []);
      setCategories(c?.length ? c : ['Beverages', 'Bakery', 'Food', 'Snacks', 'Electronics', 'Accessories']);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleUserLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('pos_user', JSON.stringify(user));
    setCustomerInfo({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    setCurrentView('store');
  };

  const handleUserLogout = async () => {
    try { await authApi.logout(); } catch (err) { console.error(err); }
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_customer');
    setCurrentView('user-auth');
  };

  const handleAdminLoginSuccess = (admin) => {
    setAdminUser(admin);
    localStorage.setItem('pos_admin', JSON.stringify(admin));
    setCurrentView('admin');
  };

  const handleAdminLogout = async () => {
    try { await authApi.logout(); } catch (err) { console.error(err); }
    setAdminUser(null);
    localStorage.removeItem('pos_admin');
    setCurrentView(currentUser ? 'store' : 'user-auth');
  };

  const handleAddToCart = (product) => {
    const id = product._id || product.id;
    const stock = Number(product.stock) || 0;
    if (stock <= 0) return alert(`"${product.name}" is Stockout.`);

    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        if (existing.quantity >= stock) return (alert(`Limit reached! Only ${stock} units available.`), prev);
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id, productId: id, name: product.name, category: product.category, price: Number(product.price), quantity: 1, description: product.description, maxStock: stock }];
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) return setCart(prev => prev.filter(i => i.id !== id));
    const prod = products.find(p => (p._id || p.id) === id);
    const stock = prod ? Number(prod.stock) : 999;
    if (newQty > stock) return (alert(`Only ${stock} unit(s) available.`), setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: stock } : i)));
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const handleConfirmOrder = async (data) => {
    try {
      setIsProcessing(true);
      setCustomerInfo(data);
      localStorage.setItem('pos_customer', JSON.stringify(data));

      await orderApi.create({
        user: { userId: currentUser?._id, name: data.name, phone: data.phone, address: data.address, email: currentUser?.email || '' },
        items: cart,
        paymentMethod: 'Cash / Card',
      });

      setCart([]);
      setIsCheckoutOpen(false);
      await loadProducts();
      alert(`Purchase completed!\n\nCustomer: ${data.name}\nPhone: ${data.phone}\nAddress: ${data.address}\n\nRecorded successfully.`);
    } catch (err) {
      alert(`Order submission failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="app">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onUserLogout={handleUserLogout}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      <main>
        {currentView === 'store' && (
          currentUser ? (
            <ShopPage
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={id => setCart(prev => prev.filter(i => i.id !== id))}
              onClearCart={() => setCart([])}
              onOpenCheckout={() => cart.length > 0 && setIsCheckoutOpen(true)}
              loading={loading}
              currentUser={currentUser}
              onGoToAuth={() => setCurrentView('user-auth')}
            />
          ) : (
            <UserAuthPage onLoginSuccess={handleUserLoginSuccess} onCancel={null} />
          )
        )}

        {currentView === 'user-auth' && (
          <UserAuthPage onLoginSuccess={handleUserLoginSuccess} onCancel={currentUser ? () => setCurrentView('store') : null} />
        )}

        {currentView === 'admin' && (
          adminUser ? (
            <AdminPage onLogout={handleAdminLogout} />
          ) : (
            <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} onCancel={() => setCurrentView(currentUser ? 'store' : 'user-auth')} />
          )
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
