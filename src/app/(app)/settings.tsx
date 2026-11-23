import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text } from 'react-native-paper';

import { AppHeader } from '@/components';
import { useAppTheme, useAuth } from '@/context';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { resetOnboarding, signOut } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Ayarlar"
        subtitle="Görünüş və hesab seçimləri"
        showDrawer
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          variant="labelLarge"
          style={[styles.sectionHeader, { color: colors.muted }]}
        >
          GÖRÜNÜŞ
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <MaterialCommunityIcons
                  name={isDark ? 'weather-night' : 'white-balance-sunny'}
                  size={20}
                  color={colors.primaryText}
                />
              </View>
              <View style={styles.textWrap}>
                <Text
                  variant="titleSmall"
                  style={{ color: colors.navy, fontWeight: '700' }}
                >
                  Qaranlıq Rejim (Dark Mode)
                </Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  İnterfeys temasını dəyişdir
                </Text>
              </View>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>

        <Text
          variant="labelLarge"
          style={[styles.sectionHeader, { color: colors.muted }]}
        >
          HESAB VƏ NAVİQASİYA
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              padding: 14,
              gap: 10,
            },
          ]}
        >
          <Button
            mode="outlined"
            icon="presentation"
            textColor={colors.primaryText}
            onPress={resetOnboarding}
            style={[styles.actionBtn, { borderColor: colors.border }]}
          >
            Tanıtım (Onboarding) Ekranını Göstər
          </Button>

          <Button
            mode="contained"
            icon="logout"
            buttonColor={colors.danger}
            textColor="#FFFFFF"
            onPress={signOut}
            style={styles.actionBtn}
          >
            Hesabdan Çıxış
          </Button>
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
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  actionBtn: {
    borderRadius: 12,
  },
});
