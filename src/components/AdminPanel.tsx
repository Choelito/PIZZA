import { useCallback, useEffect, useState } from 'react';
import {
  DollarSign,
  Package,
  TrendingUp,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatPrice } from '../useCart';
import { useAuth } from '../AuthContext';
import type { Product } from '../menuData';

interface OrderRow {
  id: string;
  user_name: string;
  user_email: string;
  order_type: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
  delivery_address: string | null;
}

type AdminTab = 'dashboard' | 'products' | 'orders';

export function AdminPanel() {
  const { signOut, user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [prodRes, orderRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order'),
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (orderRes.data) setOrders(orderRes.data as OrderRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pendiente').length;

  return (
    <div className="min-h-screen bg-crust-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-crust-200 bg-crust-900 text-crust-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sauce-500 to-crust-600">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-heading text-lg font-bold">Panel Admin</h1>
              <p className="text-xs text-crust-300">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-lg bg-crust-800 px-4 py-2 text-sm font-medium text-crust-100 transition-colors hover:bg-crust-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 px-6 pb-0">
          {(
            [
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'products', label: 'Productos' },
              { id: 'orders', label: 'Pedidos' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-sauce-500 text-white'
                  : 'border-transparent text-crust-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-crust-400" />
          </div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <Dashboard
                totalRevenue={totalRevenue}
                orderCount={orders.length}
                pendingOrders={pendingOrders}
                productCount={products.length}
                orders={orders}
              />
            )}
            {tab === 'products' && (
              <ProductsManager products={products} onChanged={fetchData} />
            )}
            {tab === 'orders' && <OrdersManager orders={orders} onChanged={fetchData} />}
          </>
        )}
      </main>
    </div>
  );
}

// =====================================================
// DASHBOARD
// =====================================================
function Dashboard({
  totalRevenue,
  orderCount,
  pendingOrders,
  productCount,
  orders,
}: {
  totalRevenue: number;
  orderCount: number;
  pendingOrders: number;
  productCount: number;
  orders: OrderRow[];
}) {
  const recentOrders = orders.slice(0, 5);
  const stats = [
    {
      label: 'Ingresos totales',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-basil-500',
    },
    {
      label: 'Pedidos totales',
      value: orderCount.toString(),
      icon: TrendingUp,
      color: 'bg-sauce-500',
    },
    {
      label: 'Pendientes',
      value: pendingOrders.toString(),
      icon: ClipboardList,
      color: 'bg-crust-500',
    },
    {
      label: 'Productos activos',
      value: productCount.toString(),
      icon: Package,
      color: 'bg-charcoal-700',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold text-crust-900">
          Resumen del negocio
        </h2>
        <p className="text-crust-500">Métricas clave de tu pizzería.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-crust-100 bg-white p-6 shadow-soft"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color} text-white`}
            >
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-heading text-2xl font-bold text-crust-900">
              {stat.value}
            </p>
            <p className="text-sm text-crust-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-crust-100 bg-white p-6 shadow-soft">
        <h3 className="mb-4 font-heading text-lg font-bold text-crust-900">
          Pedidos recientes
        </h3>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-crust-400">
            No hay pedidos todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-crust-100 text-left text-crust-500">
                  <th className="pb-2 pr-4 font-medium">Cliente</th>
                  <th className="pb-2 pr-4 font-medium">Tipo</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 pr-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-crust-50 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-crust-800">
                      {order.user_name}
                    </td>
                    <td className="py-3 pr-4 text-crust-600 capitalize">
                      {order.order_type}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 pr-4 text-right font-bold text-crust-900">
                      {formatPrice(Number(order.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pendiente: 'bg-sauce-100 text-sauce-700',
    en_preparacion: 'bg-crust-100 text-crust-700',
    listo: 'bg-basil-100 text-basil-700',
    entregado: 'bg-charcoal-100 text-charcoal-700',
  };
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En preparación',
    listo: 'Listo',
    entregado: 'Entregado',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] ?? 'bg-crust-100 text-crust-700'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

// =====================================================
// PRODUCTS MANAGER
// =====================================================
function ProductsManager({
  products,
  onChanged,
}: {
  products: Product[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (data: Partial<Product>, id?: string) => {
    if (id) {
      await supabase.from('products').update(data).eq('id', id);
    } else {
      await supabase.from('products').insert(data);
    }
    setShowForm(false);
    setEditing(null);
    onChanged();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto del menú?')) return;
    await supabase.from('products').delete().eq('id', id);
    onChanged();
  };

  const handleToggleAvailable = async (p: Product) => {
    await supabase
      .from('products')
      .update({ available: !p.available })
      .eq('id', p.id);
    onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-crust-900">
            Gestión de productos
          </h2>
          <p className="text-crust-500">
            Agrega, edita o elimina pizzas del menú.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sauce-500 to-crust-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border bg-white p-5 shadow-soft transition-all ${
              p.available ? 'border-crust-100' : 'border-crust-200 opacity-60'
            }`}
          >
            <div className="flex gap-4">
              <img
                src={p.image_url}
                alt={p.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-heading text-lg font-bold text-crust-900">
                    {p.name}
                  </h3>
                  <span className="font-bold text-sauce-600">
                    {formatPrice(p.base_price)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-crust-500 line-clamp-2">
                  {p.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-crust-200 py-2 text-xs font-medium text-crust-700 transition-colors hover:bg-crust-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                onClick={() => handleToggleAvailable(p)}
                className="flex items-center justify-center rounded-lg border border-crust-200 px-3 py-2 text-crust-600 transition-colors hover:bg-crust-50"
                title={p.available ? 'Ocultar' : 'Mostrar'}
              >
                {p.available ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex items-center justify-center rounded-lg border border-sauce-200 px-3 py-2 text-sauce-600 transition-colors hover:bg-sauce-50"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  onSave,
  onClose,
}: {
  product: Product | null;
  onSave: (data: Partial<Product>, id?: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [ingredients, setIngredients] = useState(
    product?.ingredients?.join(', ') ?? ''
  );
  const [basePrice, setBasePrice] = useState(
    product ? String(product.base_price) : ''
  );
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [vegetarian, setVegetarian] = useState(product?.vegetarian ?? false);
  const [spicy, setSpicy] = useState(product?.spicy ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(
      {
        name,
        description,
        ingredients: ingredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        base_price: parseFloat(basePrice) || 0,
        image_url:
          imageUrl ||
          'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=800',
        vegetarian,
        spicy,
        available: true,
        sort_order: product?.sort_order ?? 99,
      },
      product?.id
    );
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-crust-900">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-crust-400 hover:bg-crust-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-base"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input-base resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (USD)">
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                className="input-base"
              />
            </Field>
            <Field label="Ingredientes (separados por coma)">
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="input-base"
              />
            </Field>
          </div>
          <Field label="URL de la imagen">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="input-base"
            />
          </Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-crust-700">
              <input
                type="checkbox"
                checked={vegetarian}
                onChange={(e) => setVegetarian(e.target.checked)}
                className="h-4 w-4 accent-basil-500"
              />
              Vegetariana
            </label>
            <label className="flex items-center gap-2 text-sm text-crust-700">
              <input
                type="checkbox"
                checked={spicy}
                onChange={(e) => setSpicy(e.target.checked)}
                className="h-4 w-4 accent-sauce-500"
              />
              Picante
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sauce-500 to-crust-600 py-3 text-sm font-bold text-white shadow-soft transition-transform enabled:hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {product ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-crust-200 px-5 py-3 text-sm font-medium text-crust-600 transition-colors hover:bg-crust-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-crust-500">
        {label}
      </span>
      {children}
    </label>
  );
}

// =====================================================
// ORDERS MANAGER
// =====================================================
function OrdersManager({
  orders,
  onChanged,
}: {
  orders: OrderRow[];
  onChanged: () => void;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await supabase.from('orders').update({ status }).eq('id', id);
    setUpdating(null);
    onChanged();
  };

  const statuses = ['pendiente', 'en_preparacion', 'listo', 'entregado'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-crust-900">
          Pedidos
        </h2>
        <p className="text-crust-500">
          Gestiona el estado de los pedidos en tiempo real.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-crust-100 bg-white py-16 text-center shadow-soft">
          <Package className="mx-auto h-12 w-12 text-crust-200" />
          <p className="mt-4 text-crust-500">
            No hay pedidos todavía.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-crust-100 bg-white p-5 shadow-soft"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-crust-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-crust-600">
                    <span className="font-medium text-crust-800">
                      {order.user_name}
                    </span>{' '}
                    · {order.user_email}
                  </p>
                  <p className="mt-0.5 text-xs text-crust-400">
                    {new Date(order.created_at).toLocaleString('es-ES', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {' · '}
                    {order.order_type === 'domicilio' ? 'Domicilio' : 'Recoger'}
                    {' · '}
                    Pago: {order.payment_method === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
                    {order.delivery_address && ` · ${order.delivery_address}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-heading text-lg font-bold text-crust-900">
                    {formatPrice(Number(order.total))}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                    disabled={updating === order.id}
                    className="rounded-lg border border-crust-200 bg-white px-3 py-1.5 text-xs font-medium text-crust-700 outline-none focus:border-sauce-500 disabled:opacity-50"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s === 'pendiente'
                          ? 'Pendiente'
                          : s === 'en_preparacion'
                          ? 'En preparación'
                          : s === 'listo'
                          ? 'Listo'
                          : 'Entregado'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
