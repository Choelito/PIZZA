import { useCallback, useMemo, useState } from 'react';
import {
  type PizzaSize,
  type Product,
  type ExtraOption,
  sizeOptions,
  DELIVERY_FEE,
  TAX_RATE,
} from './menuData';
import { supabase } from './supabaseClient';

export interface CartItem {
  uid: string;
  productId: string;
  pizzaName: string;
  image: string;
  size: PizzaSize;
  sizeLabel: string;
  extras: ExtraOption[];
  quantity: number;
  unitPrice: number;
}

interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

function computeUnitPrice(
  pizza: Product,
  size: PizzaSize,
  extras: ExtraOption[]
) {
  const sizeMult = sizeOptions.find((s) => s.id === size)?.multiplier ?? 1;
  const base = pizza.base_price * sizeMult;
  const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
  return Math.round((base + extrasTotal) * 100) / 100;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback(
    (
      pizza: Product,
      size: PizzaSize,
      extras: ExtraOption[],
      quantity: number
    ) => {
      const sizeLabel = sizeOptions.find((s) => s.id === size)?.label ?? '';
      const unitPrice = computeUnitPrice(pizza, size, extras);
      const uid = `${pizza.id}-${size}-${extras
        .map((e) => e.id)
        .sort()
        .join('_')}`;

      setItems((prev) => {
        const existing = prev.find((item) => item.uid === uid);
        if (existing) {
          return prev.map((item) =>
            item.uid === uid
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            uid,
            productId: pizza.id,
            pizzaName: pizza.name,
            image: pizza.image_url,
            size,
            sizeLabel,
            extras,
            quantity,
            unitPrice,
          },
        ];
      });
      setIsCartOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((uid: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.uid === uid
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((uid: string) => {
    setItems((prev) => prev.filter((item) => item.uid !== uid));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + deliveryFee + tax;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = useCallback(
    async (params: {
      userName: string;
      userEmail: string;
      orderType: 'domicilio' | 'recoger';
      paymentMethod: 'efectivo' | 'tarjeta';
      deliveryAddress: string;
    }): Promise<OrderResult> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: 'No hay sesión activa' };
        }

        // 1. Insertar el pedido
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            user_email: params.userEmail,
            user_name: params.userName,
            order_type: params.orderType,
            payment_method: params.paymentMethod,
            delivery_address: params.deliveryAddress || null,
            subtotal,
            delivery_fee: deliveryFee,
            tax,
            total,
            status: 'pendiente',
          })
          .select()
          .single();

        if (orderError || !order) {
          return {
            success: false,
            error: orderError?.message ?? 'Error al crear el pedido',
          };
        }

        // 2. Insertar los items del pedido
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.pizzaName,
          size: item.size,
          size_label: item.sizeLabel,
          extras: JSON.stringify(item.extras),
          quantity: item.quantity,
          unit_price: item.unitPrice,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          return { success: false, error: itemsError.message };
        }

        // 3. Enviar el correo con el ticket vía edge function
        try {
          const apiUrl = `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/send-order-email`;
          const emailResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              orderId: order.id,
              customerName: params.userName,
              customerEmail: params.userEmail,
              orderType: params.orderType,
              paymentMethod: params.paymentMethod,
              deliveryAddress: params.deliveryAddress,
              items: items.map((item) => ({
                product_name: item.pizzaName,
                size_label: item.sizeLabel,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                extras: item.extras,
              })),
              subtotal,
              deliveryFee,
              tax,
              total,
              createdAt: new Date().toISOString(),
            }),
          });
          if (!emailResponse.ok) {
            console.warn('Email send failed:', emailResponse.status);
          }
        } catch (emailErr) {
          console.warn('Email send error:', emailErr);
        }

        return { success: true, orderId: order.id };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        };
      }
    },
    [items, subtotal, deliveryFee, tax, total]
  );

  return {
    items,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    closeCart,
    openCart,
    subtotal,
    deliveryFee,
    tax,
    total,
    totalItems,
    placeOrder,
  };
}

export type CartApi = ReturnType<typeof useCart>;

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}
