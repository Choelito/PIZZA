import { ChevronDown, Pizza as PizzaIcon } from 'lucide-react';

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-crust-50 to-crust-100 py-20 md:py-28"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sauce-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-crust-300/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <span className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-sauce-200 bg-sauce-50 px-4 py-1.5 text-sm font-medium text-sauce-700">
          <PizzaIcon className="h-4 w-4" />
          Pizzas artesanales · Listas para pedir
        </span>

        <h1 className="animate-fade-in-up text-balance font-heading text-4xl font-extrabold leading-tight text-crust-900 md:text-6xl">
          Pizzas a la leña con{' '}
          <span className="bg-gradient-to-r from-sauce-600 to-crust-600 bg-clip-text text-transparent">
            ingredientes frescos
          </span>
        </h1>

        <p className="animate-fade-in-up mt-6 max-w-2xl text-balance text-lg text-crust-600 md:text-xl">
          Elige tus pizzas favoritas, personaliza el tamaño y los adicionales,
          y recibe tu pedido en casa. Masa artesanal, mozzarella fresca y
          hornos de leña.
        </p>

        <div className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
          {['Masa artesanal', 'Horno de leña', 'Entrega a domicilio'].map(
            (tag, i) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 font-medium ${
                  i % 2 === 0
                    ? 'bg-crust-100 text-crust-700'
                    : 'bg-sauce-100 text-sauce-700'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {tag}
              </span>
            )
          )}
        </div>

        <a
          href="#menu"
          className="animate-fade-in-up mt-12 inline-flex items-center gap-2 rounded-full bg-crust-800 px-6 py-3 text-sm font-semibold text-crust-50 shadow-soft transition-all hover:scale-105 hover:bg-crust-700"
        >
          Ver el menú y pedir
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
