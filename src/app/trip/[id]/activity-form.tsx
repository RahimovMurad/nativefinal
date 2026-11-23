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

import { AppHeader, FormField, LoadingState } from '@/components';
import { ACTIVITY_CATEGORIES } from '@/constants/categories';
import { useAppTheme, useTripsContext } from '@/context';
import { getActivityById } from '@/database';
import type {
  ActivityCategory,
  ActivityFormValues,
  FormErrors,
} from '@/types';
import { validateActivityForm } from '@/validators';

export default function ActivityFormScreen() {
  const { id, activityId, day, placeName: initialPlace } =
    useLocalSearchParams<{
      id: string;
      activityId?: string;
      day?: string;
      placeName?: string;
    }>();

  const router = useRouter();
  const { colors } = useAppTheme();
  const { getTripDetails, addActivity, editActivity } = useTripsContext();

  const isEditing = Boolean(activityId);
  const [maxDays, setMaxDays] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  const [dayNumber, setDayNumber] = useState(day ?? '1');
  const [title, setTitle] = useState('');
  const [placeName, setPlaceName] = useState(initialPlace ?? '');
  const [time, setTime] = useState('10:00');
  const [category, setCategory] = useState<ActivityCategory>('Sightseeing');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FormErrors<ActivityFormValues>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tripId = Number(id);

    Promise.all([
      getTripDetails(tripId),
      activityId ? getActivityById(Number(activityId)) : Promise.resolve(null),
    ])
      .then(([trip, existingAct]) => {
        if (trip) {
          setMaxDays(trip.daysCount);
        }
        if (existingAct) {
          setDayNumber(String(existingAct.dayNumber));
          setTitle(existingAct.title);
          setPlaceName(existingAct.placeName);
          setTime(existingAct.time);
          setCategory(existingAct.category);
          setEstimatedCost(String(existingAct.estimatedCost));
          setNote(existingAct.note);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, activityId, getTripDetails]);

  const handleSave = async () => {
    if (saving) return;

    const validation = validateActivityForm(
      { dayNumber, title, placeName, time, estimatedCost, note },
      maxDays
    );
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setSaving(true);
    try {
      const dto = {
        dayNumber: Number(dayNumber),
        title,
        placeName,
        time,
        category,
        estimatedCost: Number(estimatedCost || 0),
        note,
      };

      if (isEditing && activityId) {
        await editActivity(Number(activityId), dto);
      } else {
        await addActivity(Number(id), dto);
      }
      router.back();
    } catch (err) {
      Alert.alert(
        'Xəta',
        err instanceof Error ? err.message : 'Fəaliyyət yadda saxlanılmadı.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Fəaliyyət" showBack />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={isEditing ? 'Fəaliyyəti Düzəlt' : 'Fəaliyyət Əlavə Et'}
        subtitle={`1–${maxDays} gün aralığında`}
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
            <View style={styles.rowTwo}>
              <View style={styles.flex}>
                <FormField
                  label={`Gün (1-${maxDays})`}
                  keyboardType="numeric"
                  value={dayNumber}
                  onChangeText={(t) => {
                    setDayNumber(t);
                    if (errors.dayNumber) {
                      setErrors((e) => ({ ...e, dayNumber: undefined }));
                    }
                  }}
                  errorText={errors.dayNumber}
                />
              </View>
              <View style={styles.flex}>
                <FormField
                  label="Saat (HH:MM)"
                  placeholder="14:30"
                  value={time}
                  onChangeText={(t) => {
                    setTime(t);
                    if (errors.time) {
                      setErrors((e) => ({ ...e, time: undefined }));
                    }
                  }}
                  errorText={errors.time}
                />
              </View>
            </View>

            <FormField
              label="Fəaliyyət başlığı"
              placeholder="məs. Muzey ziyarəti"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
              }}
              errorText={errors.title}
            />

            <FormField
              label="Məkan adı"
              placeholder="məs. Qız Qalası"
              value={placeName}
              onChangeText={(t) => {
                setPlaceName(t);
                if (errors.placeName) {
                  setErrors((e) => ({ ...e, placeName: undefined }));
                }
              }}
              errorText={errors.placeName}
            />

            <Text
              variant="labelMedium"
              style={{ color: colors.muted, marginBottom: 8 }}
            >
              Kateqoriya
            </Text>
            <View style={styles.catGrid}>
              {ACTIVITY_CATEGORIES.map((cat) => {
                const active = category === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surfaceElevated,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        cat.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={15}
                      color={active ? '#FFFFFF' : cat.color}
                    />
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : colors.navy,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <FormField
              label="Təxmini xərc (AZN)"
              keyboardType="numeric"
              value={estimatedCost}
              onChangeText={(t) => {
                setEstimatedCost(t);
                if (errors.estimatedCost) {
                  setErrors((e) => ({ ...e, estimatedCost: undefined }));
                }
              }}
              errorText={errors.estimatedCost}
            />

            <FormField
              label="Qeyd (istəyə bağlı)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />

            <Button
              mode="contained"
              icon="check"
              loading={saving}
              disabled={saving}
              onPress={handleSave}
              buttonColor={colors.primary}
              style={styles.submitBtn}
              contentStyle={styles.submitContent}
            >
              {isEditing ? 'Yadda Saxla' : 'Plana Əlavə Et'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  submitBtn: {
    borderRadius: 14,
    marginTop: 6,
  },
  submitContent: {
    paddingVertical: 5,
  },
});
