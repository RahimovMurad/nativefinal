import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text } from 'react-native-paper';

import {
  AppHeader,
  ConfirmModal,
  DateInputModal,
  ErrorState,
  FormField,
  LoadingState,
} from '@/components';
import { useAppTheme, useTripsContext } from '@/context';
import type { FormErrors, TripFormValues, TripStatus } from '@/types';
import { validateTripForm } from '@/validators';

const STATUS_OPTIONS: { key: TripStatus; label: string }[] = [
  { key: 'upcoming', label: 'Qarşıdan gələn' },
  { key: 'active', label: 'Aktiv' },
  { key: 'completed', label: 'Tamamlanıb' },
];

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { getTripDetails, editTrip, removeTrip } = useTripsContext();

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TripStatus>('upcoming');
  const [errors, setErrors] = useState<FormErrors<TripFormValues>>({});
  const [saving, setSaving] = useState(false);

  const [dateModalTarget, setDateModalTarget] = useState<
    'start' | 'end' | null
  >(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    const tripId = Number(id);
    if (Number.isNaN(tripId)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    getTripDetails(tripId)
      .then((trip) => {
        if (!trip) {
          setNotFound(true);
          return;
        }
        setTitle(trip.title);
        setCity(trip.city);
        setCountry(trip.country);
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
        setBudget(String(trip.budget));
        setNotes(trip.notes);
        setStatus(trip.status);
      })
      .finally(() => setIsLoading(false));
  }, [id, getTripDetails]);

  const handleSave = async () => {
    if (saving) return;
    const validation = validateTripForm({
      title,
      city,
      country,
      startDate,
      endDate,
      budget,
      notes,
    });
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setSaving(true);
    try {
      await editTrip(Number(id), {
        title,
        city,
        country,
        startDate,
        endDate,
        budget: Number(budget),
        notes,
        status,
      });
      router.back();
    } catch (err) {
      Alert.alert(
        'Xəta',
        err instanceof Error ? err.message : 'Səyahət yenilənə bilmədi.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await removeTrip(Number(id));
    setDeleteVisible(false);
    router.replace('/(app)/(tabs)/trips');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Səyahəti Redaktə Et" showBack />
        <LoadingState />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Tapılmadı" showBack />
        <ErrorState message="Redaktə ediləcək səyahət tapılmadı." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Səyahəti Redaktə Et"
        subtitle={city}
        showBack
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <FormField
              label="Səyahət adı"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
              }}
              errorText={errors.title}
            />

            <View style={styles.rowTwo}>
              <View style={styles.flex}>
                <FormField
                  label="Şəhər"
                  value={city}
                  onChangeText={(t) => {
                    setCity(t);
                    if (errors.city) {
                      setErrors((e) => ({ ...e, city: undefined }));
                    }
                  }}
                  errorText={errors.city}
                />
              </View>
              <View style={styles.flex}>
                <FormField
                  label="Ölkə"
                  value={country}
                  onChangeText={(t) => {
                    setCountry(t);
                    if (errors.country) {
                      setErrors((e) => ({ ...e, country: undefined }));
                    }
                  }}
                  errorText={errors.country}
                />
              </View>
            </View>

            <View style={styles.rowTwo}>
              <Pressable
                style={[
                  styles.dateBox,
                  {
                    borderColor: errors.startDate
                      ? colors.danger
                      : colors.border,
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
                onPress={() => setDateModalTarget('start')}
              >
                <Text variant="labelSmall" style={{ color: colors.muted }}>
                  Başlanğıc
                </Text>
                <View style={styles.dateValRow}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.dateVal, { color: colors.navy }]}>
                    {startDate}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.dateBox,
                  {
                    borderColor: errors.endDate
                      ? colors.danger
                      : colors.border,
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
                onPress={() => setDateModalTarget('end')}
              >
                <Text variant="labelSmall" style={{ color: colors.muted }}>
                  Bitmə
                </Text>
                <View style={styles.dateValRow}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.dateVal, { color: colors.navy }]}>
                    {endDate}
                  </Text>
                </View>
              </Pressable>
            </View>

            {errors.startDate || errors.endDate ? (
              <Text style={[styles.dateErr, { color: colors.danger }]}>
                {errors.startDate ?? errors.endDate}
              </Text>
            ) : null}

            <FormField
              label="Ümumi Büdcə (AZN)"
              keyboardType="numeric"
              value={budget}
              onChangeText={(t) => {
                setBudget(t);
                if (errors.budget) {
                  setErrors((e) => ({ ...e, budget: undefined }));
                }
              }}
              errorText={errors.budget}
            />

            <Text
              variant="labelMedium"
              style={{ color: colors.muted, marginBottom: 8 }}
            >
              Səyahət Statusu
            </Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setStatus(opt.key)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surfaceElevated,
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
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <FormField
              label="Qeydlər"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <Button
              mode="contained"
              icon="content-save-outline"
              loading={saving}
              disabled={saving}
              onPress={handleSave}
              buttonColor={colors.primary}
              style={styles.saveBtn}
            >
              Dəyişiklikləri Saxla
            </Button>

            <Button
              mode="outlined"
              icon="trash-can-outline"
              textColor={colors.danger}
              onPress={() => setDeleteVisible(true)}
              style={[styles.delBtn, { borderColor: colors.danger }]}
            >
              Səyahəti Sil
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateInputModal
        visible={dateModalTarget !== null}
        title={
          dateModalTarget === 'start'
            ? 'Başlanğıc Tarixi'
            : 'Bitmə Tarixi'
        }
        initialDate={dateModalTarget === 'start' ? startDate : endDate}
        onClose={() => setDateModalTarget(null)}
        onSelect={(iso) => {
          if (dateModalTarget === 'start') {
            setStartDate(iso);
            setErrors((e) => ({ ...e, startDate: undefined }));
          } else {
            setEndDate(iso);
            setErrors((e) => ({ ...e, endDate: undefined }));
          }
        }}
      />

      <ConfirmModal
        visible={deleteVisible}
        title="Səyahəti silmək istəyirsiniz?"
        message="Bu səyahət və ona bağlı bütün məlumatlar silinəcək."
        confirmLabel="Sil"
        destructive
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  dateValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateVal: {
    fontWeight: '700',
    fontSize: 14,
  },
  dateErr: {
    fontSize: 12,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  saveBtn: {
    borderRadius: 12,
    marginTop: 4,
  },
  delBtn: {
    borderRadius: 12,
    marginTop: 10,
  },
});
