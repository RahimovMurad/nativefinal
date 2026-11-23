import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import {
  calculateBudgetRatio,
  getBudgetStatusColor,
} from '@/utils/budgetUtils';
import { money } from '@/utils/format';

type Props = {
  budget: number;
  spent: number;
  title?: string;
};

export function BudgetProgressCard({
  budget,
  spent,
  title = 'Büdcə İzləməsi',
}: Props) {
  const { colors } = useAppTheme();
  const ratio = calculateBudgetRatio(spent, budget);
  const clampedPercent = Math.min(100, Math.max(0, ratio));
  const barColor = getBudgetStatusColor(ratio, colors);
  const remaining = budget - spent;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clampedPercent,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clampedPercent, progressAnim]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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
      <View style={styles.headerRow}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: colors.navy }]}
        >
          {title}
        </Text>
        <View
          style={[
            styles.percentPill,
            { backgroundColor: `${barColor}20` },
          ]}
        >
          <Text style={[styles.percentText, { color: barColor }]}>
            {ratio}% istifadə
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text variant="labelSmall" style={{ color: colors.muted }}>
            Xərclənən
          </Text>
          <Text
            variant="titleSmall"
            style={[styles.statVal, { color: barColor }]}
          >
            {money(spent)}
          </Text>
        </View>

        <View style={styles.statCol}>
          <Text variant="labelSmall" style={{ color: colors.muted }}>
            Ümumi Büdcə
          </Text>
          <Text
            variant="titleSmall"
            style={[styles.statVal, { color: colors.navy }]}
          >
            {money(budget)}
          </Text>
        </View>

        <View style={styles.statColEnd}>
          <Text variant="labelSmall" style={{ color: colors.muted }}>
            {remaining >= 0 ? 'Qalıq' : 'Limit Aşımı'}
          </Text>
          <Text
            variant="titleSmall"
            style={[
              styles.statVal,
              { color: remaining >= 0 ? colors.success : colors.danger },
            ]}
          >
            {money(Math.abs(remaining))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontWeight: '700',
  },
  percentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  statCol: {
    flex: 1,
  },
  statColEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statVal: {
    fontWeight: '700',
    marginTop: 2,
  },
});
