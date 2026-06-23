import { Pizza } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-crust-200 bg-crust-900 text-crust-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sauce-500 to-crust-600 text-white shadow-glow">
            <Pizza className="h-6 w-6" />
          </span>
          <div>
            <p className="font-heading text-xl font-bold text-crust-50">
              PizzApp — Pizzas artesanales a la leña
            </p>
            <p className="mt-2 text-sm text-crust-300">
              Masa hecha a mano, mozzarella fresca y hornos de leña.
              Domicilio rápido y pago fácil.
            </p>
          </div>
          <p className="text-xs text-crust-400">
            © {new Date().getFullYear()} PizzApp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
