import { Pizza, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
}

export function Header({ cartCount, onCartOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-crust-100 bg-crust-50/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sauce-500 to-crust-600 text-white shadow-soft">
            <Pizza className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold text-crust-800">
              PizzApp
            </span>
            <span className="text-xs font-medium text-crust-500">
              Pizzas artesanales a la leña
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-crust-700 md:flex">
          <a href="#inicio" className="transition-colors hover:text-sauce-600">
            Inicio
          </a>
          <a href="#menu" className="transition-colors hover:text-sauce-600">
            Menú
          </a>
        </nav>
        <button
          onClick={onCartOpen}
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-crust-800 text-crust-50 shadow-soft transition-transform hover:scale-105"
          aria-label="Abrir carrito"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sauce-500 text-xs font-bold text-white ring-2 ring-crust-50">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
