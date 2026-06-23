import { AuthProvider, useAuth } from './AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OrderMenu } from './components/OrderMenu';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { useCart } from './useCart';
import { Loader2 } from 'lucide-react';

function UserInterface() {
  const cart = useCart();

  return (
    <div className="min-h-screen bg-crust-50 text-crust-900">
      <Header cartCount={cart.totalItems} onCartOpen={cart.openCart} />
      <main>
        <Hero />
        <OrderMenu cart={cart} />
      </main>
      <Footer />
      <CartDrawer cart={cart} />
    </div>
  );
}

function AppRouter() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crust-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-sauce-500" />
          <p className="text-sm text-crust-500">Cargando PizzApp...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (role === 'admin') {
    return <AdminPanel />;
  }

  return <UserInterface />;
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
