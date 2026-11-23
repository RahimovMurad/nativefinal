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
import type { FormErrors, RegisterFormValues } from '@/types';
import { validateRegisterForm } from '@/validators';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors } = useAppTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({});
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (busy) return;

    const validation = validateRegisterForm({
      fullName,
      email,
      password,
      confirmPassword,
    });
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setBusy(true);
    try {
      const result = await signUp(fullName, email, password);
      if (!result.ok) {
        Alert.alert(
          'Qeydiyyat alınmadı',
          result.error ?? 'Bu məlumatlarla qeydiyyat mümkün olmadı.'
        );
      }
    } catch {
      Alert.alert('Xəta', 'Hesab yaradılarkən xəta baş verdi.');
    } finally {
      setBusy(false);
    }
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
          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.backBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color={colors.navy}
              />
            </Pressable>
            <Text
              variant="headlineSmall"
              style={[styles.headerTitle, { color: colors.navy }]}
            >
              Yeni Hesab Yarat
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
            <FormField
              label="Ad və Soyad"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                if (errors.fullName) {
                  setErrors((e) => ({ ...e, fullName: undefined }));
                }
              }}
              errorText={errors.fullName}
            />

            <FormField
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              errorText={errors.email}
            />

            <FormField
              label="Şifrə (min. 6 simvol)"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
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

            <FormField
              label="Şifrəni təsdiqlə"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errors.confirmPassword) {
                  setErrors((e) => ({ ...e, confirmPassword: undefined }));
                }
              }}
              secureTextEntry={!passwordVisible}
              errorText={errors.confirmPassword}
            />

            <Button
              mode="contained"
              loading={busy}
              disabled={busy}
              onPress={handleRegister}
              buttonColor={colors.primary}
              style={styles.submitBtn}
              contentStyle={styles.submitContent}
            >
              Qeydiyyatı Tamamla
            </Button>
          </Surface>

          <View style={styles.footerRow}>
            <Text style={{ color: colors.muted }}>Artıq hesabınız var?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Daxil ol
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  submitBtn: {
    marginTop: 6,
    borderRadius: 12,
  },
  submitContent: {
    paddingVertical: 5,
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
