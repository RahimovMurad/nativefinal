import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  label: string;
  value: string;
  accent?: string;
  icon?: string;
};

export function StatCard({ label, value, accent, icon }: Props) {
  const { colors } = useAppTheme();
  const topColor = accent ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          borderTopColor: topColor,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text
          variant="labelMedium"
          style={[styles.label, { color: colors.muted }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {icon ? (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={topColor}
          />
        ) : null}
      </View>

      <Text
        variant="headlineSmall"
        style={[styles.value, { color: colors.navy }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    padding: 15,
    borderRadius: 16,
    borderTopWidth: 3,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  label: {
    flex: 1,
    fontWeight: '600',
  },
  value: {
    marginTop: 8,
    fontWeight: '800',
  },
});
