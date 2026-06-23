import { useState } from 'react';
import { Plus, Leaf, Flame, Check } from 'lucide-react';
import { type Product } from '../menuData';
import { sizeOptions, extraOptions } from '../menuData';
import { type CartApi, formatPrice } from '../useCart';

interface PizzaCardProps {
  pizza: Product;
  cart: CartApi;
}

export function PizzaCard({ pizza, cart }: PizzaCardProps) {
  const [size, setSize] = useState(sizeOptions[0].id);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const currentSize = sizeOptions.find((s) => s.id === size)!;
  const extras = extraOptions.filter((e) => selectedExtras.includes(e.id));
  const unitPrice =
    Math.round(pizza.base_price * currentSize.multiplier * 100) / 100 +
    extras.reduce((sum, e) => sum + e.price, 0);

  const handleAdd = () => {
    cart.addToCart(pizza, size, extras, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-crust-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={pizza.image_url}
          alt={pizza.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {pizza.vegetarian && (
            <span className="inline-flex items-center gap-1 rounded-full bg-basil-500 px-2.5 py-1 text-xs font-semibold text-white shadow-soft">
              <Leaf className="h-3 w-3" /> Veg
            </span>
          )}
          {pizza.spicy && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sauce-500 px-2.5 py-1 text-xs font-semibold text-white shadow-soft">
              <Flame className="h-3 w-3" /> Picante
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <h3 className="font-heading text-2xl font-bold text-white drop-shadow">
            {pizza.name}
          </h3>
          <span className="rounded-lg bg-crust-900/80 px-2.5 py-1 text-sm font-bold text-crust-50 backdrop-blur">
            {formatPrice(pizza.base_price)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-relaxed text-crust-600">
          {pizza.description}
        </p>

        {/* Size selector */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-crust-500">
            Tamaño
          </p>
          <div className="grid grid-cols-3 gap-2">
            {sizeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSize(opt.id)}
                className={`rounded-xl border px-2 py-2 text-center transition-all ${
                  size === opt.id
                    ? 'border-sauce-500 bg-sauce-50 text-sauce-700'
                    : 'border-crust-100 bg-white text-crust-600 hover:border-crust-300'
                }`}
              >
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className="block text-xs text-crust-400">{opt.diameter}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-crust-500">
            Adicionales
          </p>
          <div className="flex flex-wrap gap-2">
            {extraOptions.map((extra) => {
              const active = selectedExtras.includes(extra.id);
              return (
                <button
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'border-basil-500 bg-basil-50 text-basil-700'
                      : 'border-crust-100 bg-white text-crust-600 hover:border-crust-300'
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded ${
                      active ? 'bg-basil-500' : 'bg-crust-100'
                    }`}
                  >
                    {active && <Check className="h-2.5 w-2.5 text-white" />}
                  </span>
                  {extra.label}
                  <span className="text-crust-400">+{formatPrice(extra.price)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity + add */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-xl border border-crust-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-crust-600 transition-colors hover:bg-crust-50"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-crust-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-crust-600 transition-colors hover:bg-crust-50"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:scale-[1.02] ${
              added
                ? 'bg-basil-500'
                : 'bg-gradient-to-r from-sauce-500 to-crust-600'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Agregado
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> {formatPrice(unitPrice)}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
