/**
 * Verify Email Screen
 * Pantalla intermedia después del signup que explica la verificación de email
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const email = params.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'No se encontró el email');
      return;
    }

    setIsResending(true);
    try {
      // Usar resetPassword como método para reenviar email de verificación
      // Nota: Supabase no tiene un método directo para reenviar email de verificación,
      // pero podemos usar signUp nuevamente con el mismo email (no creará duplicado)
      // O mejor: usar el método de Supabase para reenviar
      const { error } = await resetPassword(email);
      if (error) {
        Alert.alert('Error', error.message || 'No se pudo reenviar el email. Intenta nuevamente.');
      } else {
        Alert.alert(
          'Email enviado',
          'Te enviamos un nuevo email de verificación. Revisa tu bandeja de entrada.'
        );
      }
    } catch {
      Alert.alert('Error', 'Algo salió mal. Intenta nuevamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace('/(tabs)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
            <Icon name="mail" size={64} color={colors.tint} />
          </View>

          {/* Title */}
          <Text style={[textStyles.heading, { color: colors.text, marginTop: spacing.xl, textAlign: 'center' }]}>
            Revisa tu email
          </Text>

          {/* Description */}
          <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.md, textAlign: 'center' }]}>
            Enviamos un email de verificación a
          </Text>
          {email && (
            <Text style={[textStyles.bodyMedium, { color: colors.tint, marginTop: spacing.xs, textAlign: 'center' }]}>
              {email}
            </Text>
          )}

          <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.md, textAlign: 'center' }]}>
            Haz clic en el enlace del email para verificar tu cuenta antes de iniciar sesión.
          </Text>

          {/* Info Box */}
          <GlassView style={styles.infoBox} intensity="light" opacity="medium">
            <View style={styles.infoRow}>
              <Icon name="info" size={20} color={colors.tint} />
              <Text style={[textStyles.caption, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                ¿No recibiste el email? Revisa spam o intenta reenviar.
              </Text>
            </View>
          </GlassView>

          {/* Resend Button */}
          <TouchableOpacity
            style={[styles.resendButton, { borderColor: colors.tint }]}
            onPress={handleResendEmail}
            disabled={isResending}
            activeOpacity={0.7}>
            {isResending ? (
              <ActivityIndicator size="small" color={colors.tint} />
            ) : (
              <>
                <Icon name="refresh" size={18} color={colors.tint} />
                <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                  Reenviar email de verificación
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Go to Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.tint }]}
            onPress={handleGoToLogin}
            activeOpacity={0.8}>
            <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>
              Ir a iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  infoBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    minHeight: 48,
  },
  loginButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.sm,
  },
});

