import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { Destination } from '@/types';
import { moneyCompact } from '@/utils/format';

type Props = {
  destination: Destination;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  compact?: boolean;
};

export const DestinationCard = memo(function DestinationCard({
  destination,
  isFavorite,
  onPress,
  onToggleFavorite,
  compact = false,
}: Props) {
  const { colors } = useAppTheme();

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactWrap,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <ImageBackground
          source={{ uri: destination.imageUrl }}
          style={styles.compactImage}
          imageStyle={styles.compactImageStyle}
        >
          <View style={styles.overlayTop}>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={13} color="#FBBF24" />
              <Text style={styles.ratingText}>{destination.rating}</Text>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              hitSlop={8}
              style={styles.heartBtn}
            >
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#EF4444' : '#FFFFFF'}
              />
            </Pressable>
          </View>

          <View style={styles.compactBottomOverlay}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {destination.name}
            </Text>
            <Text style={styles.compactSub} numberOfLines={1}>
              {destination.country} • ~{moneyCompact(destination.avgDailyCost)}/gün
            </Text>
          </View>
        </ImageBackground>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.93 : 1,
        },
      ]}
    >
      <ImageBackground
        source={{ uri: destination.imageUrl }}
        style={[styles.heroImage, { backgroundColor: colors.surfaceElevated }]}
        imageStyle={styles.heroImageRadius}
      >
        <View style={styles.overlayTop}>
          <View
            style={[styles.categoryPill, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.categoryText}>{destination.category}</Text>
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            hitSlop={8}
            style={styles.heartBtn}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text
              variant="titleMedium"
              style={[styles.name, { color: colors.navy }]}
              numberOfLines={1}
            >
              {destination.name}
            </Text>
            <View style={styles.countryRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={colors.primaryText}
              />
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {destination.country}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.ratingChip,
              { backgroundColor: colors.warningSoft },
            ]}
          >
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.warning}
            />
            <Text style={[styles.ratingChipText, { color: colors.navy }]}>
              {destination.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text
          variant="bodySmall"
          style={[styles.desc, { color: colors.muted }]}
          numberOfLines={2}
        >
          {destination.description}
        </Text>

        <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
          <Text variant="labelSmall" style={{ color: colors.muted }}>
            Mövsüm: {destination.bestSeason}
          </Text>
          <Text
            variant="labelMedium"
            style={{ color: colors.primaryText, fontWeight: '700' }}
          >
            ~{moneyCompact(destination.avgDailyCost)} / gün
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  compactWrap: {
    width: 220,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
  },
  compactImage: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  compactImageStyle: {
    borderRadius: 18,
  },
  compactBottomOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  compactSub: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroImage: {
    height: 168,
    justifyContent: 'flex-start',
    padding: 12,
  },
  heroImageRadius: {
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  overlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    fontWeight: '700',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    marginTop: 8,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
