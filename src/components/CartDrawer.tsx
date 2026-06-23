import { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Bike,
  CreditCard,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { type CartApi, formatPrice } from '../useCart';
import { useAuth } from '../AuthContext';

interface CartDrawerProps {
  cart: CartApi;
}

type CheckoutStep = 'cart' | 'details' | 'processing' | 'success';

export function CartDrawer({ cart }: CartDrawerProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [orderType, setOrderType] = useState<'domicilio' | 'recoger'>(
    'domicilio'
  );
  const [payMethod, setPayMethod] = useState<'efectivo' | 'tarjeta'>('efectivo');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-llenar datos del usuario autenticado
  useEffect(() => {
    if (user?.email) {
      // Si el nombre del perfil está disponible en metadata
      const metaName = user.user_metadata?.full_name as string | undefined;
      if (metaName) setName(metaName);
    }
  }, [user]);

  // Reset step + lock body scroll when cart opens
  useEffect(() => {
    if (cart.isCartOpen) {
      setStep('cart');
      setErrorMsg('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cart.isCartOpen]);

  const handleClose = () => cart.closeCart();

  const handleConfirm = async () => {
    setStep('processing');
    setErrorMsg('');
    const result = await cart.placeOrder({
      userName: name,
      userEmail: user?.email ?? '',
      orderType,
      paymentMethod: payMethod,
      deliveryAddress: orderType === 'domicilio' ? address : '',
    });
    if (result.success && result.orderId) {
      setOrderId(result.orderId);
      setTimeout(() => setStep('success'), 800);
    } else {
      setErrorMsg(result.error ?? 'Error al procesar el pedido');
      setStep('details');
    }
  };

  const handleNewOrder = () => {
    cart.clearCart();
    setOrderId('');
    handleClose();
  };

  if (!cart.isCartOpen) return null;

  const canConfirm =
    name.trim().length > 1 &&
    phone.trim().length > 5 &&
    (orderType === 'recoger' || address.trim().length > 4);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className="absolute inset-0 animate-fade-in bg-charcoal-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-fade-in-up flex-col bg-crust-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-crust-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sauce-500 text-white">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-crust-900">
                {step === 'success'
                  ? '¡Pedido confirmado!'
                  : step === 'processing'
                  ? 'Procesando...'
                  : 'Tu pedido'}
              </h2>
              {step !== 'success' && step !== 'processing' && (
                <p className="text-xs text-crust-500">
                  {cart.totalItems}{' '}
                  {cart.totalItems === 1 ? 'pizza' : 'pizzas'}
                </p>
              )}
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-crust-500 transition-colors hover:bg-crust-100 hover:text-crust-800"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mx-5 mt-4 rounded-xl border border-sauce-200 bg-sauce-50 px-4 py-3 text-sm text-sauce-700">
            {errorMsg}
          </div>
        )}

        {/* CART STEP */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-crust-100 text-crust-300">
                    <ShoppingCart className="h-10 w-10" />
                  </span>
                  <p className="mt-4 font-heading text-lg font-bold text-crust-800">
                    Tu carrito está vacío
                  </p>
                  <p className="mt-1 text-sm text-crust-500">
                    Agrega pizzas del menú para empezar tu pedido.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.items.map((item) => (
                    <li
                      key={item.uid}
                      className="flex gap-3 rounded-xl border border-crust-100 bg-white p-3 shadow-soft"
                    >
                      <img
                        src={item.image}
                        alt={item.pizzaName}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-heading text-sm font-bold text-crust-900">
                              {item.pizzaName}
                            </p>
                            <p className="text-xs text-crust-500">
                              {item.sizeLabel}
                              {item.extras.length > 0 && (
                                <>
                                  {' '}
                                  ·{' '}
                                  {item.extras
                                    .map((e) => e.label)
                                    .join(', ')}
                                </>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => cart.removeItem(item.uid)}
                            className="text-crust-300 transition-colors hover:text-sauce-600"
                            aria-label="Eliminar item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-lg border border-crust-200">
                            <button
                              onClick={() =>
                                cart.updateQuantity(item.uid, -1)
                              }
                              className="flex h-7 w-7 items-center justify-center text-crust-600 hover:bg-crust-50"
                              aria-label="Restar"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-crust-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                cart.updateQuantity(item.uid, 1)
                              }
                              className="flex h-7 w-7 items-center justify-center text-crust-600 hover:bg-crust-50"
                              aria-label="Sumar"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-crust-900">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Totals + checkout */}
            {cart.items.length > 0 && (
              <div className="border-t border-crust-200 bg-white px-5 py-4">
                <SummaryRows
                  subtotal={cart.subtotal}
                  deliveryFee={cart.deliveryFee}
                  tax={cart.tax}
                  total={cart.total}
                />
                <button
                  onClick={() => setStep('details')}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sauce-500 to-crust-600 px-4 py-3 text-sm font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
                >
                  Continuar al pago
                </button>
              </div>
            )}
          </>
        )}

        {/* DETAILS STEP */}
        {step === 'details' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <h3 className="mb-3 font-heading text-base font-bold text-crust-900">
                Tipo de entrega
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: 'domicilio', label: 'Domicilio', icon: Bike },
                    {
                      id: 'recoger',
                      label: 'Recoger',
                      icon: ShoppingCart,
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setOrderType(opt.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-semibold transition-all ${
                      orderType === opt.id
                        ? 'border-sauce-500 bg-sauce-50 text-sauce-700'
                        : 'border-crust-100 text-crust-600 hover:border-crust-300'
                    }`}
                  >
                    <opt.icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                ))}
              </div>

              <h3 className="mb-3 mt-6 font-heading text-base font-bold text-crust-900">
                Método de pago
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPayMethod('efectivo')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                    payMethod === 'efectivo'
                      ? 'border-basil-500 bg-basil-50 text-basil-700'
                      : 'border-crust-100 text-crust-600 hover:border-crust-300'
                  }`}
                >
                  Efectivo
                </button>
                <button
                  onClick={() => setPayMethod('tarjeta')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                    payMethod === 'tarjeta'
                      ? 'border-basil-500 bg-basil-50 text-basil-700'
                      : 'border-crust-100 text-crust-600 hover:border-crust-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Tarjeta
                </button>
              </div>

              <h3 className="mb-3 mt-6 font-heading text-base font-bold text-crust-900">
                Tus datos
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-crust-200 bg-white px-4 py-2.5 text-sm text-crust-800 outline-none transition-colors focus:border-sauce-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-crust-200 bg-white px-4 py-2.5 text-sm text-crust-800 outline-none transition-colors focus:border-sauce-500"
                />
                {orderType === 'domicilio' && (
                  <input
                    type="text"
                    placeholder="Dirección de entrega"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-crust-200 bg-white px-4 py-2.5 text-sm text-crust-800 outline-none transition-colors focus:border-sauce-500"
                  />
                )}
              </div>
            </div>

            <div className="border-t border-crust-200 bg-white px-5 py-4">
              <SummaryRows
                subtotal={cart.subtotal}
                deliveryFee={cart.deliveryFee}
                tax={cart.tax}
                total={cart.total}
              />
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sauce-500 to-crust-600 px-4 py-3 text-sm font-bold text-white shadow-soft transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar pedido · {formatPrice(cart.total)}
              </button>
              <button
                onClick={() => setStep('cart')}
                className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-medium text-crust-500 transition-colors hover:bg-crust-50"
              >
                Volver al carrito
              </button>
            </div>
          </>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="relative">
              <span className="flex h-24 w-24 animate-spin items-center justify-center rounded-full border-4 border-crust-100 border-t-sauce-500" />
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-pulse text-sauce-500" />
              </span>
            </div>
            <h3 className="mt-6 font-heading text-xl font-bold text-crust-900">
              Procesando tu pedido...
            </h3>
            <p className="mt-2 text-sm text-crust-500">
              Guardando tu pedido y enviando confirmación por correo.
            </p>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            {/* Animated success */}
            <div className="relative mb-2">
              <span
                className="absolute inset-0 rounded-full bg-basil-400/60"
                style={{ animation: 'pulse-ring 1.5s ease-out 2' }}
              />
              <span
                className="absolute inset-0 rounded-full bg-basil-300/50"
                style={{ animation: 'pulse-ring 1.5s ease-out 0.4s 2' }}
              />
              <span
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-basil-500 text-white shadow-glow"
                style={{
                  animation: 'fade-in-up 0.5s ease-out',
                }}
              >
                <CheckCircle2
                  className="h-12 w-12"
                  style={{ animation: 'fade-in 0.4s ease-out 0.2s both' }}
                />
              </span>
            </div>

            <h3
              className="mt-4 font-heading text-2xl font-bold text-crust-900"
              style={{ animation: 'fade-in-up 0.5s ease-out 0.3s both' }}
            >
              ¡Pedido confirmado!
            </h3>
            <p
              className="mt-2 max-w-xs text-sm text-crust-600"
              style={{ animation: 'fade-in-up 0.5s ease-out 0.45s both' }}
            >
              Gracias, <span className="font-semibold">{name}</span>. Tu pedido
              de {cart.totalItems}{' '}
              {cart.totalItems === 1 ? 'pizza' : 'pizzas'} ha sido enviado a
              cocina.{' '}
              {orderType === 'domicilio'
                ? 'Llegará a tu dirección en 30-40 min.'
                : 'Estará lista para recoger en 20 min.'}
            </p>

            <div
              className="mt-6 w-full rounded-xl border border-crust-100 bg-white p-4 text-left text-sm shadow-soft"
              style={{ animation: 'fade-in-up 0.5s ease-out 0.6s both' }}
            >
              <div className="flex justify-between">
                <span className="text-crust-500">Pedido #</span>
                <span className="font-bold text-crust-900">
                  {orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-crust-500">Total pagado</span>
                <span className="font-bold text-crust-900">
                  {formatPrice(cart.total)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-crust-500">Pago</span>
                <span className="font-medium text-crust-700 capitalize">
                  {payMethod}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-crust-500">Entrega</span>
                <span className="font-medium text-crust-700 capitalize">
                  {orderType === 'domicilio' ? 'Domicilio' : 'Recoger'}
                </span>
              </div>
              <div className="mt-2 border-t border-crust-100 pt-2 text-xs text-basil-700">
                📧 Se envió una copia del ticket a tu correo.
              </div>
            </div>

            <button
              onClick={handleNewOrder}
              className="mt-6 w-full rounded-xl bg-crust-800 px-4 py-3 text-sm font-bold text-crust-50 shadow-soft transition-transform hover:scale-[1.02]"
              style={{ animation: 'fade-in-up 0.5s ease-out 0.75s both' }}
            >
              Hacer otro pedido
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function SummaryRows({
  subtotal,
  deliveryFee,
  tax,
  total,
}: {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between text-crust-600">
        <span>Subtotal</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-crust-600">
        <span>Domicilio</span>
        <span className="font-medium">
          {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratis'}
        </span>
      </div>
      <div className="flex justify-between text-crust-600">
        <span>Impuestos (10%)</span>
        <span className="font-medium">{formatPrice(tax)}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-crust-100 pt-2 text-base font-bold text-crust-900">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
