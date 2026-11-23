import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { Place } from '@/types';
import { moneyCompact } from '@/utils/format';

type Props = {
  place: Place;
  onAddToTrip?: () => void;
};

export function PlaceCard({ place, onAddToTrip }: Props) {
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
      <Image source={{ uri: place.imageUrl }} style={styles.thumb} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            variant="titleSmall"
            style={[styles.title, { color: colors.navy }]}
            numberOfLines={1}
          >
            {place.name}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.warning}
            />
            <Text style={[styles.rating, { color: colors.navy }]}>
              {place.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text
          variant="bodySmall"
          style={[styles.desc, { color: colors.muted }]}
          numberOfLines={2}
        >
          {place.description}
        </Text>

        <Text
          variant="labelSmall"
          style={[styles.metaText, { color: colors.muted }]}
          numberOfLines={1}
        >
          {place.category} • {place.durationHours} saat •{' '}
          {place.estimatedCost === 0
            ? 'Ödənişsiz'
            : moneyCompact(place.estimatedCost)}
        </Text>

        {onAddToTrip ? (
          <Pressable
            onPress={onAddToTrip}
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: colors.primaryLight,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="plus"
              size={14}
              color={colors.primaryText}
            />
            <Text style={[styles.addText, { color: colors.primaryText }]}>
              Plana əlavə et
            </Text>
          </Pressable>
        ) : null}
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
    gap: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    marginTop: 2,
    lineHeight: 17,
  },
  metaText: {
    marginTop: 6,
    flexShrink: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
