import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { getActivityCategoryMeta } from '@/constants/categories';
import { useAppTheme } from '@/context/ThemeContext';
import type { Activity } from '@/types';
import { moneyCompact } from '@/utils/format';

type Props = {
  activity: Activity;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ActivityItemCard({
  activity,
  onToggleComplete,
  onEdit,
  onDelete,
}: Props) {
  const { colors } = useAppTheme();
  const meta = getActivityCategoryMeta(activity.category);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: activity.isCompleted ? 0.78 : 1,
        },
      ]}
    >
      <Pressable onPress={onToggleComplete} style={styles.checkWrap}>
        <MaterialCommunityIcons
          name={
            activity.isCompleted
              ? 'checkbox-marked-circle'
              : 'checkbox-blank-circle-outline'
          }
          size={24}
          color={activity.isCompleted ? colors.success : colors.muted}
        />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View
            style={[styles.timeBadge, { backgroundColor: `${meta.color}18` }]}
          >
            <MaterialCommunityIcons
              name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={13}
              color={meta.color}
            />
            <Text style={[styles.timeText, { color: meta.color }]}>
              {activity.time} • {meta.label}
            </Text>
          </View>

          {activity.estimatedCost > 0 ? (
            <Text
              variant="labelMedium"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              ~{moneyCompact(activity.estimatedCost)}
            </Text>
          ) : null}
        </View>

        <Text
          variant="titleSmall"
          style={[
            styles.title,
            {
              color: colors.navy,
              textDecorationLine: activity.isCompleted
                ? 'line-through'
                : 'none',
            },
          ]}
        >
          {activity.title}
        </Text>

        <View style={styles.placeRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={14}
            color={colors.primary}
          />
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            {activity.placeName}
          </Text>
        </View>

        {activity.note ? (
          <Text
            variant="bodySmall"
            style={[styles.note, { color: colors.muted }]}
          >
            {activity.note}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable onPress={onEdit} style={styles.iconAction}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.actionTxt, { color: colors.primary }]}>
              Düzəliş
            </Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.iconAction}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
              color={colors.danger}
            />
            <Text style={[styles.actionTxt, { color: colors.danger }]}>Sil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 10,
  },
  checkWrap: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontWeight: '700',
    marginTop: 6,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  note: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 8,
  },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
});
