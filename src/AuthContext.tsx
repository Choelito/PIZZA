import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export type UserRole = 'user' | 'admin' | null;

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'user' | 'admin'
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial de sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        fetchRole(data.session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  // onAuthStateChange — envolvemos async en IIFE para evitar deadlock
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        (async () => {
          setSession(newSession);
          if (newSession?.user) {
            await fetchRole(newSession.user.id);
          } else {
            setRole(null);
            setLoading(false);
          }
        })();
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) {
      // Si no hay perfil todavía, reintentar en 1s (trigger puede no haber corrido)
      setTimeout(async () => {
        const { data: retry } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        setRole(retry?.role ?? 'user');
        setLoading(false);
      }, 1000);
      return;
    }
    setRole(data.role);
    setLoading(false);
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      accountRole: 'user' | 'admin'
    ) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: accountRole,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // Si el usuario eligió admin, actualizar el rol del perfil después del trigger
      if (data.user && accountRole === 'admin') {
        // El trigger crea el perfil con role='user'; lo actualizamos a admin
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id);
      }

      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
