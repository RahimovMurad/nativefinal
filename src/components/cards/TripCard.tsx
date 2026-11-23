import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { TripStatus, TripSummary } from '@/types';
import {
  calculateBudgetRatio,
  getBudgetStatusColor,
} from '@/utils/budgetUtils';
import { formatShortDate, moneyCompact } from '@/utils/format';

type Props = {
  trip: TripSummary;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const STATUS_LABELS: Record<TripStatus, string> = {
  active: 'Aktiv',
  upcoming: 'Qarşıdan gələn',
  completed: 'Tamamlanıb',
};

export function TripCard({ trip, onPress, onEdit, onDelete }: Props) {
  const { colors } = useAppTheme();

  const statusColors: Record<TripStatus, { bg: string; fg: string }> = {
    active: { bg: colors.successSoft, fg: colors.success },
    upcoming: { bg: colors.primaryLight, fg: colors.primaryText },
    completed: { bg: colors.surfaceElevated, fg: colors.muted },
  };

  const ratio = calculateBudgetRatio(trip.totalExpenses, trip.budget);
  const barColor = getBudgetStatusColor(ratio, colors);
  const badge = statusColors[trip.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Image source={{ uri: trip.coverImage }} style={styles.cover} />

        <View style={styles.infoCol}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusText, { color: badge.fg }]}>
                {STATUS_LABELS[trip.status]}
              </Text>
            </View>
            <Text variant="labelSmall" style={{ color: colors.muted }}>
              {trip.daysCount} gün
            </Text>
          </View>

          <Text
            variant="titleMedium"
            style={[styles.title, { color: colors.navy }]}
            numberOfLines={1}
          >
            {trip.title}
          </Text>

          <View style={styles.locRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={colors.primary}
            />
            <Text
              variant="bodySmall"
              style={{ color: colors.muted }}
              numberOfLines={1}
            >
              {trip.city}, {trip.country}
            </Text>
          </View>

          <View style={styles.locRow}>
            <MaterialCommunityIcons
              name="calendar-range"
              size={14}
              color={colors.muted}
            />
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              {formatShortDate(trip.startDate)} – {formatShortDate(trip.endDate)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.budgetSection}>
        <View style={styles.budgetLabels}>
          <Text variant="labelSmall" style={{ color: colors.muted }}>
            Plan: {trip.completedActivityCount}/{trip.activityCount} fəaliyyət
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: colors.navy, fontWeight: '700' }}
          >
            {moneyCompact(trip.totalExpenses)} / {moneyCompact(trip.budget)}
          </Text>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.surfaceElevated },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, ratio)}%`,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          {onEdit ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.actionBtn}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.actionLabel, { color: colors.primary }]}>
                Redaktə et
              </Text>
            </Pressable>
          ) : null}

          {onDelete ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.actionBtn}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={16}
                color={colors.danger}
              />
              <Text style={[styles.actionLabel, { color: colors.danger }]}>
                Sil
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cover: {
    width: 92,
    height: 92,
    borderRadius: 14,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontWeight: '700',
    marginTop: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  budgetSection: {
    marginTop: 12,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
