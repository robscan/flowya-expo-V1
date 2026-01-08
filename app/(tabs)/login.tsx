/**
 * Login Screen
 * Scope 8: Autenticación con Supabase
 * 
 * Pantalla de inicio de sesión.
 * Permite a usuarios existentes autenticarse.
 */

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading: authLoading, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required fields', 'Enter your email and password');
      return;
    }

    // Validar formato de email
    if (!isValidEmail(email.trim())) {
      Alert.alert('Invalid email', 'Enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        // Mensajes de error específicos
        let errorMessage = 'Couldn\'t sign in';
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid')) {
          errorMessage = 'Email or password incorrect';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Connection error. Check your internet and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        Alert.alert('Sign in error', errorMessage);
      } else {
        // Redirección se maneja en useEffect
        router.replace('/(tabs)/home');
      }
    } catch {
      Alert.alert('Unexpected error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSignup = () => {
    router.push('/(tabs)/signup');
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Enter your email to reset password');
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert('Invalid email', 'Enter a valid email address');
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        Alert.alert('Error', error.message || 'Couldn\'t send reset email. Try again.');
      } else {
        Alert.alert(
          'Email sent',
          'Check your email to reset your password. Check spam if you don\'t see it.'
        );
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setIsResettingPassword(false);
    }
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
            <Text style={[textStyles.heading, { color: colors.text }]}>Sign in</Text>
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
                  placeholder="••••••••"
                  placeholderTextColor={colors.icon}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  editable={!isLoading}
                  onSubmitEditing={handleSignIn}
                />
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Sign in</Text>
                )}
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={isLoading || isResettingPassword}
                activeOpacity={0.7}
                style={{ marginTop: spacing.sm }}>
                {isResettingPassword ? (
                  <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                  <Text style={[textStyles.body, { color: colors.tint, textAlign: 'center' }]}>
                    Forgot password?
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={[textStyles.body, { color: colors.icon }]}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={handleNavigateToSignup} disabled={isLoading} activeOpacity={0.7}>
                  <Text style={[textStyles.body, { color: colors.tint, fontFamily: fontFamilyMedium }]}>
                    Create account
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

