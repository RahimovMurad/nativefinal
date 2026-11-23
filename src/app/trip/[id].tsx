import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';

import {
  AppHeader,
  BudgetProgressCard,
  ConfirmModal,
  ErrorState,
  LoadingState,
  ReminderModal,
} from '@/components';
import { useAppTheme, useTripsContext } from '@/context';
import { getActivitiesByTripId, getExpensesByTripId } from '@/database';
import { scheduleTripReminder } from '@/services/device/notificationService';
import type { Activity, Expense, TripSummary } from '@/types';
import { getDaysUntilTrip } from '@/utils/dateUtils';
import { formatShortDate, money } from '@/utils/format';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { getTripDetails, removeTrip } = useTripsContext();

  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const loadTripData = useCallback(async () => {
    const tripId = Number(id);
    if (Number.isNaN(tripId)) {
      setIsLoading(false);
      return;
    }

    try {
      const [details, acts, exps] = await Promise.all([
        getTripDetails(tripId),
        getActivitiesByTripId(tripId),
        getExpensesByTripId(tripId),
      ]);
      setTrip(details);
      setActivities(acts);
      setExpenses(exps);
    } finally {
      setIsLoading(false);
    }
  }, [id, getTripDetails]);

  useFocusEffect(
    useCallback(() => {
      loadTripData();
    }, [loadTripData])
  );

  const handleScheduleReminder = async () => {
    if (!trip) return;
    const res = await scheduleTripReminder(
      trip.title,
      trip.city,
      trip.startDate
    );
    setReminderStatus(res.message);
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;
    await removeTrip(trip.id);
    setDeleteVisible(false);
    router.replace('/(app)/(tabs)/trips');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Səyahət Detalları" showBack />
        <LoadingState label="Səyahət məlumatları yüklənir..." />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Səyahət Tapılmadı" showBack />
        <ErrorState
          message="Axtardığınız səyahət tapılmadı və ya silinib."
          onRetry={loadTripData}
        />
      </View>
    );
  }

  const daysUntil = getDaysUntilTrip(trip.startDate);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={trip.title}
        subtitle={`${trip.city}, ${trip.country}`}
        showBack
        rightIcon="pencil-outline"
        onRightPress={() =>
          router.push({
            pathname: '/trip/edit/[id]',
            params: { id: String(trip.id) },
          })
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={{ uri: trip.coverImage }}
          style={styles.banner}
          imageStyle={styles.bannerImg}
        >
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerTop}>
              <View
                style={[styles.daysBadge, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.daysBadgeTxt}>
                  {daysUntil > 0
                    ? `${daysUntil} gün qalıb`
                    : trip.status === 'active'
                      ? 'Davam edir'
                      : 'Tamamlanıb'}
                </Text>
              </View>
              <Text style={styles.durationTxt}>{trip.daysCount} günlük plan</Text>
            </View>

            <View>
              <Text variant="headlineSmall" style={styles.bannerTitle}>
                {trip.city}, {trip.country}
              </Text>
              <Text style={styles.bannerDates}>
                {formatShortDate(trip.startDate)} –{' '}
                {formatShortDate(trip.endDate)}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.sectionGap}>
          <BudgetProgressCard
            budget={trip.budget}
            spent={trip.totalExpenses}
          />
        </View>

        <View style={styles.actionsGrid}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/trip/[id]/itinerary',
                params: { id: String(trip.id) },
              })
            }
            style={[
              styles.actionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.tileIcon,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={colors.primaryText}
              />
            </View>
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              Günlük Plan
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              {activities.length} fəaliyyət
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/trip/[id]/expenses',
                params: { id: String(trip.id) },
              })
            }
            style={[
              styles.actionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.tileIcon,
                { backgroundColor: colors.successSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={24}
                color={colors.success}
              />
            </View>
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              Xərclər & Qrafik
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              {expenses.length} xərc qeydi
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/trip/edit/[id]',
                params: { id: String(trip.id) },
              })
            }
            style={[
              styles.actionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.tileIcon,
                { backgroundColor: colors.warningSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="file-edit-outline"
                size={24}
                color={colors.warning}
              />
            </View>
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              Səyahəti Düzəlt
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              Tarix və büdcə
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setReminderStatus(null);
              setReminderVisible(true);
            }}
            style={[
              styles.actionTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.tileIcon,
                { backgroundColor: colors.infoSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={24}
                color={colors.info}
              />
            </View>
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              Xatırlatma Qur
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              Lokal bildiriş
            </Text>
          </Pressable>
        </View>

        {trip.notes ? (
          <View
            style={[
              styles.notesCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700', marginBottom: 4 }}
            >
              Səyahət Qeydləri
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.muted }}>
              {trip.notes}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.previewCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.previewHeader}>
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              Son Fəaliyyətlər
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/trip/[id]/itinerary',
                  params: { id: String(trip.id) },
                })
              }
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                Hamısına bax →
              </Text>
            </Pressable>
          </View>

          {activities.length === 0 ? (
            <Text style={{ color: colors.muted }}>
              Hələ fəaliyyət əlavə edilməyib.
            </Text>
          ) : (
            activities.slice(0, 3).map((act) => (
              <View
                key={act.id}
                style={[
                  styles.previewItem,
                  { borderTopColor: colors.border },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{ color: colors.primary, fontWeight: '700' }}
                >
                  Gün {act.dayNumber} • {act.time}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: colors.navy, fontWeight: '600' }}
                >
                  {act.title}
                </Text>
              </View>
            ))
          )}
        </View>

        <View
          style={[
            styles.previewCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.previewHeader}>
            <Text
              variant="titleSmall"
              style={{ color: colors.navy, fontWeight: '700' }}
            >
              Son Xərclər
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/trip/[id]/expenses',
                  params: { id: String(trip.id) },
                })
              }
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                Hamısına bax →
              </Text>
            </Pressable>
          </View>

          {expenses.length === 0 ? (
            <Text style={{ color: colors.muted }}>
              Hələ xərc əlavə edilməyib.
            </Text>
          ) : (
            expenses.slice(0, 3).map((exp) => (
              <View
                key={exp.id}
                style={[
                  styles.previewExpRow,
                  { borderTopColor: colors.border },
                ]}
              >
                <Text style={{ color: colors.navy, fontWeight: '600', flex: 1 }}>
                  {exp.title}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {money(exp.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        <Button
          mode="outlined"
          icon="trash-can-outline"
          textColor={colors.danger}
          onPress={() => setDeleteVisible(true)}
          style={[styles.deleteBtn, { borderColor: colors.danger }]}
        >
          Səyahəti Sil
        </Button>
      </ScrollView>

      <ReminderModal
        visible={reminderVisible}
        tripTitle={trip.title}
        startDate={trip.startDate}
        statusMessage={reminderStatus}
        onClose={() => setReminderVisible(false)}
        onSchedule={handleScheduleReminder}
      />

      <ConfirmModal
        visible={deleteVisible}
        title="Səyahəti silmək istəyirsiniz?"
        message="Səyahət və ona bağlı bütün günlük planlar və xərclər silinəcək."
        confirmLabel="Sil"
        destructive
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDeleteTrip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  banner: {
    height: 175,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerImg: {
    borderRadius: 20,
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 16,
    justifyContent: 'space-between',
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  daysBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  durationTxt: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bannerDates: {
    color: '#E2E8F0',
    marginTop: 2,
  },
  sectionGap: {
    marginTop: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  actionTile: {
    width: '48.4%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notesCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  previewCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewItem: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 2,
  },
  previewExpRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    marginTop: 20,
    borderRadius: 14,
  },
});
