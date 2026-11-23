import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, Text } from 'react-native-paper';

import {
  AppHeader,
  ConfirmModal,
  EmptyState,
  ErrorState,
  LoadingState,
  StatCard,
  TripCard,
} from '@/components';
import { useAppTheme } from '@/context';
import { useTrips } from '@/hooks';
import type { TripStatus, TripSummary } from '@/types';
import { moneyCompact } from '@/utils/format';

type FilterOption = TripStatus | 'all';

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'Hamısı' },
  { key: 'active', label: 'Aktiv' },
  { key: 'upcoming', label: 'Qarşıdan gələn' },
  { key: 'completed', label: 'Keçmiş' },
];

export default function TripsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');
  const [deleteTarget, setDeleteTarget] = useState<TripSummary | null>(null);

  const {
    filteredTrips,
    stats,
    isLoading,
    error,
    refreshTrips,
    removeTrip,
  } = useTrips(statusFilter);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await removeTrip(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Səyahətlərim"
        subtitle="Aktiv, qarşıdan gələn və keçmiş planlar"
        showDrawer
        rightIcon="plus"
        onRightPress={() => router.push('/trip/create')}
      />

      {isLoading && filteredTrips.length === 0 ? (
        <LoadingState label="Səyahətlər yüklənir..." />
      ) : error && filteredTrips.length === 0 ? (
        <ErrorState message={error} onRetry={() => refreshTrips()} />
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refreshTrips()}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <View style={styles.statsRow}>
                <StatCard
                  label="Ümumi Plan"
                  value={String(stats.tripCount)}
                  icon="bag-suitcase"
                  accent={colors.primary}
                />
                <StatCard
                  label="Ümumi Büdcə"
                  value={moneyCompact(stats.totalBudget)}
                  icon="wallet-outline"
                  accent={colors.success}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTER_OPTIONS.map((opt) => {
                  const active = statusFilter === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setStatusFilter(opt.key)}
                      style={[
                        styles.filterChip,
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
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() =>
                router.push({
                  pathname: '/trip/[id]',
                  params: { id: String(item.id) },
                })
              }
              onEdit={() =>
                router.push({
                  pathname: '/trip/edit/[id]',
                  params: { id: String(item.id) },
                })
              }
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="airplane-plus"
              title="Səyahət tapılmadı"
              description="Yeni səyahət yaradaraq günlük planınızı və xərc büdcənizi idarə edin."
              actionLabel="Səyahət Yarat"
              onAction={() => router.push('/trip/create')}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={() => router.push('/trip/create')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#FFFFFF"
      />

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="Səyahəti silmək istəyirsiniz?"
        message={`"${deleteTarget?.title ?? ''}" səyahəti və ona aid bütün fəaliyyət/xərclər silinəcək.`}
        confirmLabel="Sil"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  headerWrap: {
    marginBottom: 14,
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterRow: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    borderRadius: 16,
  },
});
