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
import { useAutoLogout } from './hooks/useAutoLogout';
import './App.css';

const getStored = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStored('pos_user'));
  const [adminUser, setAdminUser] = useState(() => getStored('pos_admin'));
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('pos_view') || (getStored('pos_admin') ? 'admin' : 'store'));
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(() => {
    const u = getStored('pos_user');
    return u ? { name: u.name || '', phone: u.phone || '', address: u.address || '' } : getStored('pos_customer');
  });

  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
    localStorage.setItem('pos_view', view);
  }, []);

  const clearAuth = useCallback(() => {
    setCurrentUser(null);
    setAdminUser(null);
    setCart([]);
    ['pos_user', 'pos_admin', 'pos_customer', 'pos_view'].forEach((k) => localStorage.removeItem(k));
  }, []);

  const handleAutoLogout = useCallback(async (reason) => {
    try { await authApi.logout(); } catch {}
    const wasAdmin = !!adminUser;
    clearAuth();
    const target = wasAdmin ? 'admin-login' : 'user-auth';
    handleNavigate(target);
    alert(reason === 'inactivity' ? 'You have been automatically signed out due to 15 minutes of inactivity.' : 'Your session has expired. Please log in again.');
  }, [adminUser, clearAuth, handleNavigate]);

  useAutoLogout({ isAuthenticated: !!(currentUser || adminUser), onLogout: handleAutoLogout });

  useEffect(() => {
    const onUnauth = () => { if (currentUser || adminUser) handleAutoLogout('expired'); };
    window.addEventListener('auth:unauthorized', onUnauth);
    return () => window.removeEventListener('auth:unauthorized', onUnauth);
  }, [currentUser, adminUser, handleAutoLogout]);

  useEffect(() => {
    authApi.getMe().then((res) => {
      const saved = localStorage.getItem('pos_view');
      if (res.user?.role === 'admin') {
        setAdminUser(res.user);
        localStorage.setItem('pos_admin', JSON.stringify(res.user));
        handleNavigate(saved && saved !== 'user-auth' ? saved : 'admin');
      } else if (res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('pos_user', JSON.stringify(res.user));
        setCustomerInfo({ name: res.user.name || '', phone: res.user.phone || '', address: res.user.address || '' });
        handleNavigate(saved && saved !== 'admin-login' ? saved : 'store');
      } else clearAuth();
    }).catch(clearAuth);
  }, [clearAuth, handleNavigate]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([productApi.getAll(), productApi.getCategories()]);
      setProducts(p || []);
      setCategories(c || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (currentView === 'store') loadProducts();
  }, [currentView, loadProducts]);

  const handleUserLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('pos_user', JSON.stringify(user));
    setCustomerInfo({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    handleNavigate('store');
  };

  const handleUserLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    handleNavigate('user-auth');
  };

  const handleAdminLoginSuccess = (admin) => {
    setAdminUser(admin);
    localStorage.setItem('pos_admin', JSON.stringify(admin));
    handleNavigate('admin');
  };

  const handleAdminLogout = async () => {
    try { await authApi.logout(); } catch {}
    setAdminUser(null);
    localStorage.removeItem('pos_admin');
    handleNavigate(currentUser ? 'store' : 'admin-login');
  };

  const handleAddToCart = (product) => {
    const id = product._id || product.id;
    const stock = Number(product.stock) || 0;
    if (stock <= 0) return alert(`"${product.name}" is Stockout.`);
    setCart((prev) => {
      const exist = prev.find((i) => i.id === id);
      if (exist) {
        if (exist.quantity >= stock) return (alert(`Limit reached! Only ${stock} units available.`), prev);
        return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id,
        productId: id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        quantity: 1,
        description: product.description,
        maxStock: stock
      }];
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) return setCart((prev) => prev.filter((i) => i.id !== id));
    const prod = products.find((p) => (p._id || p.id) === id);
    const stock = prod ? Number(prod.stock) : 999;
    if (newQty > stock) {
      alert(`Only ${stock} unit(s) available.`);
      return setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: stock } : i));
    }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i));
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
    } finally { setIsProcessing(false); }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="app">
      <Navbar currentView={currentView} setCurrentView={handleNavigate} currentUser={currentUser} onUserLogout={handleUserLogout} adminUser={adminUser} onAdminLogout={handleAdminLogout} />
      <main>
        {currentView === 'store' && (
          currentUser ? (
            <ShopPage products={products} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} cart={cart} onAddToCart={handleAddToCart} onUpdateQty={handleUpdateQty} onRemoveItem={(id) => setCart((p) => p.filter((i) => i.id !== id))} onClearCart={() => setCart([])} onOpenCheckout={() => cart.length > 0 && setIsCheckoutOpen(true)} loading={loading} currentUser={currentUser} onGoToAuth={() => handleNavigate('user-auth')} />
          ) : <UserAuthPage onLoginSuccess={handleUserLoginSuccess} onCancel={null} />
        )}
        {currentView === 'user-auth' && <UserAuthPage onLoginSuccess={handleUserLoginSuccess} onCancel={currentUser ? () => handleNavigate('store') : null} />}
        {currentView === 'admin' && (adminUser ? <AdminPage onLogout={handleAdminLogout} onProductsUpdated={loadProducts} /> : <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} onCancel={() => handleNavigate(currentUser ? 'store' : 'user-auth')} />)}
        {currentView === 'admin-login' && <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} onCancel={() => handleNavigate(currentUser ? 'store' : 'user-auth')} />}
      </main>
      <CustomerModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onConfirmOrder={handleConfirmOrder} cartTotal={cartTotal} cartItemsCount={cartItemsCount} isProcessing={isProcessing} initialData={customerInfo} />
    </div>
  );
}
