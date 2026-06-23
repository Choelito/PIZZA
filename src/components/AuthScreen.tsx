import { useState } from 'react';
import {
  Pizza,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [accountRole, setAccountRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(
            error === 'Invalid login credentials'
              ? 'Correo o contraseña incorrectos'
              : error
          );
        }
      } else {
        if (fullName.trim().length < 2) {
          setError('Ingresa tu nombre completo');
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        const { error } = await signUp(email, password, fullName, accountRole);
        if (error) {
          setError(
            error === 'User already registered'
              ? 'Este correo ya está registrado'
              : error
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-charcoal-900/50" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Brand */}
        <div className="mb-6 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sauce-500 to-crust-600 text-white shadow-glow backdrop-blur-md">
            <Pizza className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold text-white drop-shadow-lg">
            PizzApp
          </h1>
          <p className="mt-1 text-sm text-crust-100/90 drop-shadow">
            Pizzas artesanales a la leña
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-xl bg-white/10 p-1">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-crust-900 shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-crust-900 shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <h2 className="mb-5 text-center font-heading text-xl font-bold text-white">
            {mode === 'login'
              ? 'Bienvenido de nuevo'
              : 'Crea tu cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder-white/50 outline-none transition-colors focus:border-white/40 focus:bg-white/15"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder-white/50 outline-none transition-colors focus:border-white/40 focus:bg-white/15"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-11 text-sm text-white placeholder-white/50 outline-none transition-colors focus:border-white/40 focus:bg-white/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Account type selector (signup only) */}
            {mode === 'signup' && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                  Tipo de cuenta
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountRole('user')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      accountRole === 'user'
                        ? 'border-white/60 bg-white/20 text-white'
                        : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-xs font-semibold">Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountRole('admin')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      accountRole === 'admin'
                        ? 'border-white/60 bg-white/20 text-white'
                        : 'border-white/15 bg-white/5 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                    <span className="text-xs font-semibold">Admin</span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/50">
                  {accountRole === 'user'
                    ? 'Podrás pedir pizzas y ver tus pedidos.'
                    : 'Acceso al panel de gestión: ventas y productos.'}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-sauce-300/40 bg-sauce-500/20 px-4 py-3 text-sm text-sauce-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sauce-500 to-crust-600 py-3 text-sm font-bold text-white shadow-glow transition-transform enabled:hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : mode === 'login' ? (
                'Iniciar sesión'
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/50">
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-semibold text-white underline-offset-2 hover:underline"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
