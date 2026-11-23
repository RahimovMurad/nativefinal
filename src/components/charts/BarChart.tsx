import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { ChartPoint } from '@/types';

type Props = {
  title: string;
  points: ChartPoint[];
  emptyMessage?: string;
};

export function BarChart({
  title,
  points,
  emptyMessage = 'Hələ qrafik üçün xərc məlumatı yoxdur.',
}: Props) {
  const { colors } = useAppTheme();
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text variant="titleMedium" style={[styles.title, { color: colors.navy }]}>
        {title}
      </Text>

      {points.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>
          {emptyMessage}
        </Text>
      ) : (
        <View style={styles.chart}>
          {points.map((p, index) => {
            const percent = Math.max(4, (p.value / max) * 100);

            return (
              <View style={styles.column} key={`${p.label}-${index}`}>
                <Text
                  style={[styles.amount, { color: colors.muted }]}
                  numberOfLines={1}
                >
                  {p.value.toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  })}
                </Text>

                <View style={styles.barSpace}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: p.color ?? colors.primary,
                        height: `${percent}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[styles.caption, { color: colors.muted }]}
                  numberOfLines={1}
                >
                  {p.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
  },
  title: {
    fontWeight: '700',
  },
  empty: {
    paddingVertical: 25,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    marginTop: 18,
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  amount: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  barSpace: {
    width: '72%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 4,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 7,
  },
});
