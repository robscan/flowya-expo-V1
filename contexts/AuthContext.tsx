/**
 * AuthContext - Gestión de autenticación de usuarios
 * Scope 8: Autenticación con Supabase
 * 
 * Funciones:
 * - signUp: Registrar nuevo usuario
 * - signIn: Iniciar sesión
 * - signOut: Cerrar sesión
 * - resetPassword: Enviar email de recuperación de contraseña
 * - Persistencia de sesión con AsyncStorage
 */

import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@flowya_auth_session';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  const saveSession = async (session: Session) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!isSupabaseConfigured) {
        // Si Supabase no está configurado, intentar cargar desde AsyncStorage
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            setSession(parsedSession);
            setUser(parsedSession?.user ?? null);
          } catch (parseError) {
            console.error('Error parsing stored session:', parseError);
            await clearSession();
          }
        }
        setIsLoading(false);
        return;
      }
      
      // Primero intentar obtener sesión actual de Supabase
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error loading session:', error);
        // Intentar cargar desde AsyncStorage como fallback
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            setSession(parsedSession);
            setUser(parsedSession?.user ?? null);
          } catch (parseError) {
            console.error('Error parsing stored session:', parseError);
            await clearSession();
          }
        }
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession) {
          await saveSession(currentSession);
        }
      }
    } catch (error) {
      console.error('Error in loadSession:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Suscribirse a cambios de autenticación (solo si Supabase está configurado)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          await saveSession(session);
        } else {
          await clearSession();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        error: { 
          message: 'Authentication service is not configured. Please contact support.',
          name: 'ConfigurationError',
          status: 500,
        } as AuthError 
      };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: 'flowya://verify-email',
        },
      });

      if (error) {
        console.error('SignUp error:', error);
        return { error };
      }

      // Nota: Supabase puede no retornar una sesión inmediatamente si requiere verificación de email
      // Esto es normal y esperado
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await saveSession(data.session);
      } else if (data.user) {
        // Usuario creado pero requiere verificación de email
        // No establecer sesión hasta que el email sea verificado
        console.log('User created, email verification required');
      }

      return { error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500,
        } as AuthError 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase not configured') as AuthError };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await saveSession(data.session);
      }

      return { error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setUser(null);
      await clearSession();
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setSession(null);
      setUser(null);
      await clearSession();
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase not configured') as AuthError };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'flowya://reset-password',
      });

      return { error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

