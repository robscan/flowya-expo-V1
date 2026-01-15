/**
 * Signup Screen
 * Scope 8: Autenticación con Supabase
 * 
 * Pantalla de registro de nuevos usuarios.
 */

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signUp, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, authLoading, router]);

  // Validar formato de email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Obtener mensaje de error amigable desde error de Supabase
  const getErrorMessage = (error: any): string => {
    if (!error || !error.message) {
      return 'No se pudo crear la cuenta. Intenta nuevamente.';
    }

    const errorMessage = error.message.toLowerCase();

    // Errores comunes de Supabase
    if (errorMessage.includes('user already registered') || errorMessage.includes('already registered')) {
      return 'Este email ya está registrado. Intenta iniciar sesión.';
    }
    if (errorMessage.includes('invalid email') || errorMessage.includes('email')) {
      return 'Ingresa un email válido.';
    }
    if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      return 'La contraseña es muy débil. Usa al menos 6 caracteres con letras y números.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return 'Error de conexión. Revisa tu internet e intenta de nuevo.';
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
    }

    // Retornar mensaje original si no coincide con ningún patrón conocido
    return error.message;
  };

  const handleSignUp = async () => {
    // Validar campos vacíos
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos');
      return;
    }

    // Validar formato de email
    if (!isValidEmail(email.trim())) {
      Alert.alert('Email inválido', 'Ingresa un email válido');
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        const friendlyMessage = getErrorMessage(error);
        Alert.alert('Error al registrarse', friendlyMessage);
      } else {
        // Éxito: usuario creado, requiere verificación de email
        // Nota: Supabase puede mostrar un error 400 en la consola cuando intenta
        // hacer sign-in automáticamente internamente después de crear un usuario no verificado.
        // Este error es esperado cuando la verificación de email está habilitada y no
        // afecta el flujo ya que manejamos correctamente el caso de verificación requerida.
        // Redirigir a pantalla de verificación
        router.push({
          pathname: '/verify-email',
          params: { email: email.trim() },
        });
      }
    } catch (error: any) {
      console.error('Unexpected error in signup:', error);
      Alert.alert('Error inesperado', 'Algo salió mal. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.push('/(tabs)/login');
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}>
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[textStyles.heading, { color: colors.text }]}>Crear cuenta</Text>
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* Form */}
          <GlassView style={styles.formContainer} intensity="light" opacity="medium">
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon + '30',
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.icon}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                  Contraseña
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon + '30',
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="•••••••• (mín. 6 caracteres)"
                  placeholderTextColor={colors.icon}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                  Confirmar contraseña
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon + '30',
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.icon}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  autoCorrect={false}
                  editable={!isLoading}
                  onSubmitEditing={handleSignUp}
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Crear cuenta</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[textStyles.body, { color: colors.icon }]}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={handleNavigateToLogin} disabled={isLoading} activeOpacity={0.7}>
                  <Text style={[textStyles.body, { color: colors.tint, fontFamily: fontFamilyMedium }]}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  formContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontFamily: fontFamily,
    minHeight: 48,
  },
  primaryButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

