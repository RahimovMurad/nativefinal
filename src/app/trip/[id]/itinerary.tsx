import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, Text } from 'react-native-paper';

import {
  ActivityItemCard,
  AppHeader,
  ConfirmModal,
  EmptyState,
  LoadingState,
} from '@/components';
import { useAppTheme, useTripsContext } from '@/context';
import { getActivitiesByTripId } from '@/database';
import type { Activity, TripSummary } from '@/types';
import { getDayDateString } from '@/utils/dateUtils';
import { formatShortDate } from '@/utils/format';

type DaySection = {
  dayNumber: number;
  title: string;
  dateLabel: string;
  data: Activity[];
};

export default function DailyItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { getTripDetails, toggleActivity, removeActivity } = useTripsContext();

  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  const loadData = useCallback(async () => {
    const tripId = Number(id);
    if (Number.isNaN(tripId)) {
      setIsLoading(false);
      return;
    }
    try {
      const [details, acts] = await Promise.all([
        getTripDetails(tripId),
        getActivitiesByTripId(tripId),
      ]);
      setTrip(details);
      setActivities(acts);
    } finally {
      setIsLoading(false);
    }
  }, [id, getTripDetails]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalDays = trip?.daysCount ?? 1;
  const dayNumbers = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => i + 1),
    [totalDays]
  );

  const sections: DaySection[] = useMemo(() => {
    const daysToShow =
      selectedDay === 'all' ? dayNumbers : [selectedDay];

    return daysToShow.map((dayNum) => {
      const dateStr = trip ? getDayDateString(trip.startDate, dayNum) : '';
      return {
        dayNumber: dayNum,
        title: `Gün ${dayNum}`,
        dateLabel: dateStr ? formatShortDate(dateStr) : '',
        data: activities.filter((a) => a.dayNumber === dayNum),
      };
    });
  }, [activities, dayNumbers, selectedDay, trip]);

  const handleToggle = async (activityId: number) => {
    await toggleActivity(activityId);
    await loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeActivity(deleteTarget.id);
    setDeleteTarget(null);
    await loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Günlük Plan"
        subtitle={trip ? `${trip.title} • ${totalDays} gün` : 'Marşrut'}
        showBack
        rightIcon="plus"
        onRightPress={() =>
          router.push({
            pathname: '/trip/[id]/activity-form',
            params: {
              id: String(id),
              day: selectedDay === 'all' ? '1' : String(selectedDay),
            },
          })
        }
      />

      {isLoading ? (
        <LoadingState label="Günlük plan yüklənir..." />
      ) : (
        <>
          <View style={styles.filterWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayChipsRow}
            >
              <Pressable
                onPress={() => setSelectedDay('all')}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor:
                      selectedDay === 'all' ? colors.primary : colors.surface,
                    borderColor:
                      selectedDay === 'all' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedDay === 'all' ? '#FFFFFF' : colors.navy,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Bütün Günlər
                </Text>
              </Pressable>

              {dayNumbers.map((d) => {
                const active = selectedDay === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setSelectedDay(d)}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : colors.navy,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      Gün {d}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View
                    style={[
                      styles.dayDot,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                  <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.navy }]}
                  >
                    {section.title}
                  </Text>
                  {section.dateLabel ? (
                    <Text variant="bodySmall" style={{ color: colors.muted }}>
                      ({section.dateLabel})
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/trip/[id]/activity-form',
                      params: {
                        id: String(id),
                        day: String(section.dayNumber),
                      },
                    })
                  }
                  style={styles.addDayBtn}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
                    Əlavə et
                  </Text>
                </Pressable>
              </View>
            )}
            renderItem={({ item }) => (
              <ActivityItemCard
                activity={item}
                onToggleComplete={() => handleToggle(item.id)}
                onEdit={() =>
                  router.push({
                    pathname: '/trip/[id]/activity-form',
                    params: {
                      id: String(id),
                      activityId: String(item.id),
                    },
                  })
                }
                onDelete={() => setDeleteTarget(item)}
              />
            )}
            renderSectionFooter={({ section }) =>
              section.data.length === 0 ? (
                <View
                  style={[
                    styles.emptyDayBox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    Bu gün üçün fəaliyyət planlanmayıb.
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="calendar-blank-outline"
                title="Plan boşdur"
                description="Günlük plana məkan, saat və qeyd əlavə edin."
                actionLabel="Fəaliyyət Əlavə Et"
                onAction={() =>
                  router.push({
                    pathname: '/trip/[id]/activity-form',
                    params: { id: String(id), day: '1' },
                  })
                }
              />
            }
          />
        </>
      )}

      <FAB
        icon="plus"
        onPress={() =>
          router.push({
            pathname: '/trip/[id]/activity-form',
            params: {
              id: String(id),
              day: selectedDay === 'all' ? '1' : String(selectedDay),
            },
          })
        }
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#FFFFFF"
      />

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="Fəaliyyəti silmək istəyirsiniz?"
        message={`"${deleteTarget?.title ?? ''}" günlük plandan silinəcək.`}
        confirmLabel="Sil"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dayChipsRow: {
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  emptyDayBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    borderRadius: 16,
  },
});
