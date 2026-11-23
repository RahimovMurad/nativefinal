import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  label?: string;
};

export function LoadingState({ label = 'Yüklənir...' }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="bodyMedium" style={[styles.label, { color: colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  label: {
    fontWeight: '500',
  },
});
