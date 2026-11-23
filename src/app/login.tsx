import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Surface, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components';
import { useAppTheme, useAuth } from '@/context';
import type { FormErrors, LoginFormValues } from '@/types';
import { validateLoginForm } from '@/validators';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useAppTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (busy) return;
    setAuthError(null);

    const validation = validateLoginForm({ email, password });
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setBusy(true);
    try {
      const result = await signIn(email, password);
      if (!result.ok) {
        setAuthError(result.error ?? 'Giriş alınmadı');
        Alert.alert('Giriş alınmadı', result.error ?? 'Məlumatları yoxlayın');
      }
    } catch {
      Alert.alert('Xəta', 'Sessiyanı saxlamaq mümkün olmadı.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@tripmate.az');
    setPassword('admin123');
    setErrors({});
    setAuthError(null);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View
              style={[styles.logoBox, { backgroundColor: colors.primary }]}
            >
              <MaterialCommunityIcons
                name="airplane-takeoff"
                size={34}
                color="#FFFFFF"
              />
            </View>
            <Text
              variant="displaySmall"
              style={[styles.brand, { color: colors.primary }]}
            >
              TripMate
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: colors.muted }]}
            >
              Səyahət planlayıcısı və kəşfiyyat bələdçiniz
            </Text>
          </View>

          <Surface
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            elevation={1}
          >
            <Text
              variant="titleLarge"
              style={[styles.formTitle, { color: colors.navy }]}
            >
              Xoş gəldiniz
            </Text>

            {authError ? (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.dangerSoft },
                ]}
              >
                <Text style={{ color: colors.danger, fontWeight: '600' }}>
                  {authError}
                </Text>
              </View>
            ) : null}

            <FormField
              label="Email və ya istifadəçi adı"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              errorText={errors.email}
            />

            <FormField
              label="Şifrə"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((e) => ({ ...e, password: undefined }));
                }
              }}
              secureTextEntry={!passwordVisible}
              errorText={errors.password}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off' : 'eye'}
                  color={colors.muted}
                  onPress={() => setPasswordVisible((prev) => !prev)}
                />
              }
            />

            <Button
              mode="contained"
              loading={busy}
              disabled={busy}
              onPress={handleLogin}
              buttonColor={colors.primary}
              style={styles.submitBtn}
              contentStyle={styles.submitContent}
            >
              Daxil ol
            </Button>

            <Pressable
              onPress={fillDemoCredentials}
              style={[
                styles.demoBox,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primaryText,
                },
              ]}
            >
              <Text style={[styles.demoText, { color: colors.primaryText }]}>
                Demo hesabını doldur: admin@tripmate.az / admin123
              </Text>
            </Pressable>
          </Surface>

          <View style={styles.footerRow}>
            <Text style={{ color: colors.muted }}>Hesabınız yoxdur?</Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Qeydiyyatdan keç
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brand: {
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  formTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 6,
    borderRadius: 12,
  },
  submitContent: {
    paddingVertical: 5,
  },
  demoBox: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  demoText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  linkText: {
    fontWeight: '700',
  },
});
