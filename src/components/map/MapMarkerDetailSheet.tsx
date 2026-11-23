import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { Destination } from '@/types';
import { moneyCompact } from '@/utils/format';

type Props = {
  destination: Destination;
  distanceKm: number | null;
  onOpenDetails: () => void;
  onPlanTrip: () => void;
};

export function MapMarkerDetailSheet({
  destination,
  distanceKm,
  onOpenDetails,
  onPlanTrip,
}: Props) {
  const { colors } = useAppTheme();

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
      <View style={styles.row}>
        <Image source={{ uri: destination.imageUrl }} style={styles.thumb} />

        <View style={styles.info}>
          <View style={styles.topLine}>
            <Text
              variant="titleMedium"
              style={[styles.name, { color: colors.navy }]}
              numberOfLines={1}
            >
              {destination.name}, {destination.country}
            </Text>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={colors.warning}
              />
              <Text style={[styles.ratingTxt, { color: colors.navy }]}>
                {destination.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <Text variant="bodySmall" style={{ color: colors.muted }}>
            {destination.category} • ~{moneyCompact(destination.avgDailyCost)}/gün
          </Text>

          <View style={styles.coordRow}>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={13}
              color={colors.primaryText}
            />
            <Text variant="labelSmall" style={{ color: colors.muted }}>
              {destination.latitude.toFixed(2)}°, {destination.longitude.toFixed(2)}°
              {distanceKm !== null ? ` • Sizdən ${distanceKm} km` : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.btnRow}>
        <Button
          mode="outlined"
          textColor={colors.primaryText}
          onPress={onOpenDetails}
          style={[styles.flexBtn, { borderColor: colors.border }]}
        >
          Detallara Bax
        </Button>
        <Button
          mode="contained"
          icon="calendar-plus"
          buttonColor={colors.primary}
          textColor="#FFFFFF"
          onPress={onPlanTrip}
          style={styles.flexBtn}
        >
          Planla
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 74,
    height: 74,
    borderRadius: 14,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  name: {
    flex: 1,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  flexBtn: {
    flex: 1,
    borderRadius: 12,
  },
});
