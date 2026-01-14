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
      return 'Couldn\'t create account. Please try again.';
    }

    const errorMessage = error.message.toLowerCase();

    // Errores comunes de Supabase
    if (errorMessage.includes('user already registered') || errorMessage.includes('already registered')) {
      return 'This email is already registered. Try signing in instead.';
    }
    if (errorMessage.includes('invalid email') || errorMessage.includes('email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      return 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return 'Connection error. Check your internet and try again.';
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    // Retornar mensaje original si no coincide con ningún patrón conocido
    return error.message;
  };

  const handleSignUp = async () => {
    // Validar campos vacíos
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Required fields', 'Please fill in all fields');
      return;
    }

    // Validar formato de email
    if (!isValidEmail(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters');
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Alert.alert('Passwords don\'t match', 'Please make sure both passwords are the same');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        const friendlyMessage = getErrorMessage(error);
        Alert.alert('Sign up error', friendlyMessage);
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
      Alert.alert('Unexpected error', 'Something went wrong. Please try again.');
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
            <Text style={[textStyles.heading, { color: colors.text }]}>Create account</Text>
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
                  placeholder="your@email.com"
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
                  Password
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
                  placeholder="•••••••• (min. 6 characters)"
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
                  Confirm Password
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
                  <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Create account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[textStyles.body, { color: colors.icon }]}>Already have an account? </Text>
                <TouchableOpacity onPress={handleNavigateToLogin} disabled={isLoading} activeOpacity={0.7}>
                  <Text style={[textStyles.body, { color: colors.tint, fontFamily: fontFamilyMedium }]}>
                    Sign in
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

