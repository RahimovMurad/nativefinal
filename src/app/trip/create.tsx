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
import { Button, Switch, Text } from 'react-native-paper';

import { AppHeader, DateInputModal, FormField } from '@/components';
import { useAppTheme, useTripsContext } from '@/context';
import { getAllDestinations } from '@/database';
import type { Destination, FormErrors, TripFormValues } from '@/types';
import { addDaysIso } from '@/utils/dateUtils';
import { localToday } from '@/utils/format';
import { validateTripForm } from '@/validators';

export default function CreateTripScreen() {
  const params = useLocalSearchParams<{
    destinationId?: string;
    city?: string;
    country?: string;
  }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { addTrip } = useTripsContext();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<number>(
    Number(params.destinationId) || 1
  );
  const [title, setTitle] = useState(
    params.city ? `${params.city} Səyahəti` : ''
  );
  const [city, setCity] = useState(params.city ?? '');
  const [country, setCountry] = useState(params.country ?? '');
  const [startDate, setStartDate] = useState(addDaysIso(localToday(), 3));
  const [endDate, setEndDate] = useState(addDaysIso(localToday(), 6));
  const [budget, setBudget] = useState('1200');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [errors, setErrors] = useState<FormErrors<TripFormValues>>({});
  const [busy, setBusy] = useState(false);

  const [dateModalTarget, setDateModalTarget] = useState<
    'start' | 'end' | null
  >(null);

  useEffect(() => {
    getAllDestinations().then((list) => {
      setDestinations(list);
      if (params.destinationId) {
        const match = list.find((d) => d.id === Number(params.destinationId));
        if (match) {
          setSelectedDestId(match.id);
          setCity(match.name);
          setCountry(match.country);
          if (!title) setTitle(`${match.name} Səyahəti`);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (dest: Destination) => {
    setSelectedDestId(dest.id);
    setCity(dest.name);
    setCountry(dest.country);
    if (!title.trim() || title.endsWith(' Səyahəti')) {
      setTitle(`${dest.name} Səyahəti`);
    }
    setErrors((e) => ({ ...e, city: undefined, country: undefined }));
  };

  const handleCreate = async () => {
    if (busy) return;
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

    const matchedDest = destinations.find((d) => d.id === selectedDestId);
    const coverImage =
      matchedDest?.imageUrl ??
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';

    setBusy(true);
    try {
      const created = await addTrip({
        title,
        destinationId: selectedDestId,
        city,
        country,
        coverImage,
        startDate,
        endDate,
        budget: Number(budget),
        notes,
        reminderEnabled,
      });

      router.replace({
        pathname: '/trip/[id]',
        params: { id: String(created.id) },
      });
    } catch (err) {
      Alert.alert(
        'Xəta',
        err instanceof Error ? err.message : 'Səyahət yaradıla bilmədi.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Yeni Səyahət Planla"
        subtitle="Şəhər, tarix və büdcə təyin edin"
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
          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: colors.muted }]}
          >
            Hazır İstiqamət Seçimi
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetRow}
          >
            {destinations.map((dest) => {
              const active =
                selectedDestId === dest.id && city === dest.name;
              return (
                <Pressable
                  key={dest.id}
                  onPress={() => handleSelectPreset(dest)}
                  style={[
                    styles.presetChip,
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
                    {dest.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <FormField
              label="Səyahətin adı"
              placeholder="məs. Qəbələ Qış İstirahəti"
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
                  Başlanğıc tarixi
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
                  Bitmə tarixi
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

            <FormField
              label="Qeydlər (istəyə bağlı)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <Text
                  variant="titleSmall"
                  style={{ color: colors.navy, fontWeight: '700' }}
                >
                  Səyahət Xatırlatması
                </Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  Səyahət tarixindən əvvəl bildiriş göndər
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
              />
            </View>

            <Button
              mode="contained"
              icon="check"
              loading={busy}
              disabled={busy}
              onPress={handleCreate}
              buttonColor={colors.primary}
              style={styles.submitBtn}
              contentStyle={styles.submitContent}
            >
              Səyahəti Yarat
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateInputModal
        visible={dateModalTarget !== null}
        title={
          dateModalTarget === 'start'
            ? 'Başlanğıc Tarixini Seç'
            : 'Bitmə Tarixini Seç'
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
  sectionLabel: {
    fontWeight: '700',
    marginBottom: 8,
  },
  presetRow: {
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  submitBtn: {
    borderRadius: 14,
  },
  submitContent: {
    paddingVertical: 5,
  },
});
