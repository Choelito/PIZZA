import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { type Product } from '../menuData';
import { supabase } from '../supabaseClient';
import { type CartApi, formatPrice } from '../useCart';
import { PizzaCard } from './PizzaCard';

interface OrderMenuProps {
  cart: CartApi;
}

export function OrderMenu({ cart }: OrderMenuProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setProducts(data as Product[]);
        }
        setLoading(false);
      });
  }, []);

  return (
    <section
      id="menu"
      className="relative scroll-mt-24 bg-crust-100/60 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-sauce-100 px-4 py-1.5 text-sm font-medium text-sauce-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sauce-500" />
            Menú interactivo
          </span>
          <h2 className="font-heading text-3xl font-bold text-crust-900 md:text-4xl">
            Arma tu pedido de pizzas
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-crust-600">
            Elige el tamaño, adicionales y cantidad de cada pizza. Todo se
            calcula en tiempo real y se envía directo a la cocina.
          </p>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-sauce-500" />
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[440px] animate-pulse rounded-2xl border border-crust-100 bg-white/60"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((pizza, i) => (
              <div
                key={pizza.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <PizzaCard pizza={pizza} cart={cart} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cart.totalItems > 0 && !cart.isCartOpen && (
        <button
          onClick={cart.openCart}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-sauce-500 to-crust-600 px-5 py-4 text-white shadow-glow transition-transform hover:scale-105 animate-fade-in-up"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-semibold">
            {cart.totalItems}{' '}
            {cart.totalItems === 1 ? 'pizza' : 'pizzas'}
          </span>
          <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-sm font-bold">
            {formatPrice(cart.total)}
          </span>
        </button>
      )}
    </section>
  );
}
