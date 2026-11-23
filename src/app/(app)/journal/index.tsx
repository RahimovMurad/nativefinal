import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';

import {
  AppHeader,
  ConfirmModal,
  EmptyState,
  FormField,
  JournalEntryCard,
  LoadingState,
} from '@/components';
import { useAppTheme, useAuth, useTripsContext } from '@/context';
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from '@/database';
import { useImagePicker } from '@/hooks';
import type { FormErrors, JournalEntry, JournalFormValues } from '@/types';
import { validateJournalForm } from '@/validators';

export default function TravelJournalScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { trips, refreshStats } = useTripsContext();
  const { pickFromGallery, takePhoto } = useImagePicker();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);

  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [content, setContent] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors<JournalFormValues>>({});
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!user?.id) {
      setEntries([]);
      setIsLoading(false);
      return;
    }
    try {
      const list = await getJournalEntries(user.id);
      setEntries(list);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const openCreateModal = () => {
    setEditingEntry(null);
    setTitle('');
    setLocationName('');
    setContent('');
    setSelectedTripId(trips[0]?.id ?? null);
    setImageUri(null);
    setErrors({});
    setModalVisible(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setLocationName(entry.locationName);
    setContent(entry.content);
    setSelectedTripId(entry.tripId);
    setImageUri(entry.imageUri);
    setErrors({});
    setModalVisible(true);
  };

  const handleChoosePhoto = () => {
    Alert.alert('Foto əlavə et', 'Mənbəni seçin', [
      {
        text: 'Qalereyadan seç',
        onPress: async () => {
          const uri = await pickFromGallery();
          if (uri) setImageUri(uri);
        },
      },
      {
        text: 'Kamera ilə çək',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) setImageUri(uri);
        },
      },
      { text: 'Ləğv et', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (saving) return;
    const validation = validateJournalForm({ title, locationName, content });
    setErrors(validation.errors);
    if (!validation.isValid) return;

    const tripMatch = trips.find((t) => t.id === selectedTripId);
    const tripTitle = tripMatch?.title ?? '';

    setSaving(true);
    try {
      if (editingEntry) {
        await updateJournalEntry(editingEntry.id, {
          tripId: selectedTripId,
          tripTitle,
          title,
          locationName,
          content,
          imageUri,
        });
      } else if (user?.id) {
        await createJournalEntry(user.id, {
          tripId: selectedTripId,
          tripTitle,
          title,
          locationName,
          content,
          imageUri,
        });
      }
      await loadEntries();
      await refreshStats();
      setModalVisible(false);
    } catch {
      Alert.alert('Xəta', 'Jurnal qeydi yadda saxlanıla bilmədi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteJournalEntry(deleteTarget.id);
    setDeleteTarget(null);
    await loadEntries();
    await refreshStats();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Səyahət Jurnalı"
        subtitle="Qeydlər və xatirə fotoları (SQLite)"
        showDrawer
        rightIcon="plus"
        onRightPress={openCreateModal}
      />

      {isLoading ? (
        <LoadingState label="Jurnal qeydləri yüklənir..." />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onEdit={() => openEditModal(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="notebook-edit-outline"
              title="Hələ səyahət qeydiniz yoxdur"
              description="Səyahətlərinizdən xatirələr və fotolar əlavə edərək offline jurnal yaradın."
              actionLabel="İlk Qeydi Əlavə Et"
              onAction={openCreateModal}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={openCreateModal}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#FFFFFF"
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text
                  variant="titleLarge"
                  style={{ color: colors.navy, fontWeight: '700' }}
                >
                  {editingEntry ? 'Qeydi Redaktə Et' : 'Yeni Jurnal Qeydi'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.muted}
                  />
                </Pressable>
              </View>

              <FormField
                label="Başlıq"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
                }}
                errorText={errors.title}
              />

              <FormField
                label="Məkan (Şəhər, Ölkə)"
                value={locationName}
                onChangeText={(t) => {
                  setLocationName(t);
                  if (errors.locationName) {
                    setErrors((e) => ({ ...e, locationName: undefined }));
                  }
                }}
                errorText={errors.locationName}
              />

              {trips.length > 0 ? (
                <View style={styles.tripPickerWrap}>
                  <Text
                    variant="labelMedium"
                    style={{ color: colors.muted, marginBottom: 6 }}
                  >
                    Əlaqəli səyahət (istəyə bağlı)
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tripChipRow}
                  >
                    {trips.map((trip) => {
                      const active = selectedTripId === trip.id;
                      return (
                        <Pressable
                          key={trip.id}
                          onPress={() =>
                            setSelectedTripId(active ? null : trip.id)
                          }
                          style={[
                            styles.tripChip,
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
                              fontWeight: '600',
                            }}
                          >
                            {trip.city}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              <FormField
                label="Xatirə və qeydləriniz"
                value={content}
                onChangeText={(t) => {
                  setContent(t);
                  if (errors.content) {
                    setErrors((e) => ({ ...e, content: undefined }));
                  }
                }}
                multiline
                numberOfLines={4}
                errorText={errors.content}
              />

              <Pressable
                onPress={handleChoosePhoto}
                style={[
                  styles.photoPickerBtn,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImg}
                  />
                ) : (
                  <View style={styles.photoEmpty}>
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={28}
                      color={colors.primary}
                    />
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>
                      Qalereyadan və ya Kameradan Foto Əlavə Et
                    </Text>
                  </View>
                )}
              </Pressable>

              {imageUri ? (
                <Button
                  mode="text"
                  textColor={colors.danger}
                  onPress={() => setImageUri(null)}
                >
                  Şəkli sil
                </Button>
              ) : null}

              <View style={styles.modalActions}>
                <Button mode="text" onPress={() => setModalVisible(false)}>
                  Ləğv et
                </Button>
                <Button
                  mode="contained"
                  loading={saving}
                  disabled={saving}
                  onPress={handleSave}
                >
                  Yadda saxla
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="Qeydi silmək istəyirsiniz?"
        message={`"${deleteTarget?.title ?? ''}" jurnal qeydi həmişəlik silinəcək.`}
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
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    borderRadius: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripPickerWrap: {
    marginBottom: 12,
  },
  tripChipRow: {
    gap: 8,
  },
  tripChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  photoPickerBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 10,
  },
  photoEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  previewImg: {
    width: '100%',
    height: 160,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
});
