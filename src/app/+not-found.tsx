import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme, useAuth } from '@/context';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { hasCompletedOnboarding, token } = useAuth();

  const handleGoHome = () => {
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
      return;
    }
    if (!token) {
      router.replace('/login');
      return;
    }
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}
      >
        <MaterialCommunityIcons
          name="map-marker-question-outline"
          size={48}
          color={colors.primaryText}
        />
      </View>
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: colors.navy }]}
      >
        Səhifə tapılmadı (404)
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.desc, { color: colors.muted }]}
      >
        Axtardığınız marşrut və ya səhifə mövcud deyil.
      </Text>
      <Button
        mode="contained"
        icon="home"
        onPress={handleGoHome}
        style={styles.btn}
      >
        Əsas səhifəyə qayıt
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    marginTop: 8,
    textAlign: 'center',
  },
  btn: {
    marginTop: 22,
    borderRadius: 12,
  },
});
