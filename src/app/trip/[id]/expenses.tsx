import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
  BarChart,
  BudgetProgressCard,
  ConfirmModal,
  DateInputModal,
  EmptyState,
  ExpenseItemCard,
  FormField,
  LoadingState,
} from '@/components';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { useAppTheme, useTripsContext } from '@/context';
import { getExpensesByTripId } from '@/database';
import type {
  Expense,
  ExpenseCategory,
  ExpenseFormValues,
  FormErrors,
  TripSummary,
} from '@/types';
import { buildCategoryChartPoints } from '@/utils/budgetUtils';
import { localToday } from '@/utils/format';
import { validateExpenseForm } from '@/validators';

export default function TripExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { getTripDetails, addExpense, editExpense, removeExpense } =
    useTripsContext();

  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Drink');
  const [date, setDate] = useState(localToday());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<FormErrors<ExpenseFormValues>>({});
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const tripId = Number(id);
    if (Number.isNaN(tripId)) {
      setIsLoading(false);
      return;
    }

    try {
      const [details, list] = await Promise.all([
        getTripDetails(tripId),
        getExpensesByTripId(tripId),
      ]);
      setTrip(details);
      setExpenses(list);
    } finally {
      setIsLoading(false);
    }
  }, [id, getTripDetails]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalSpent = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  );

  const chartPoints = useMemo(
    () => buildCategoryChartPoints(expenses),
    [expenses]
  );

  const openCreateModal = () => {
    setEditingExpense(null);
    setTitle('');
    setAmount('');
    setCategory('Food & Drink');
    setDate(localToday());
    setNote('');
    setErrors({});
    setModalVisible(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date);
    setNote(exp.note);
    setErrors({});
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (saving) return;

    const validation = validateExpenseForm({ title, amount, date, note });
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setSaving(true);
    try {
      const payload = {
        title,
        amount: Number(amount),
        category,
        date,
        note,
      };

      if (editingExpense) {
        await editExpense(editingExpense.id, payload);
      } else {
        await addExpense(Number(id), payload);
      }
      setModalVisible(false);
      await loadData();
    } catch {
      Alert.alert('Xəta', 'Xərc yadda saxlanıla bilmədi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeExpense(deleteTarget.id);
    setDeleteTarget(null);
    await loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Səyahət Xərcləri"
        subtitle={trip ? `${trip.title} (SQLite)` : 'Büdcə və qrafik'}
        showBack
        rightIcon="plus"
        onRightPress={openCreateModal}
      />

      {isLoading ? (
        <LoadingState label="Xərclər yüklənir..." />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <BudgetProgressCard
                budget={trip?.budget ?? 0}
                spent={totalSpent}
              />

              <BarChart
                title="Kateqoriyalar üzrə Xərc Qrafiki"
                points={chartPoints}
              />

              <Text
                variant="titleMedium"
                style={[styles.listTitle, { color: colors.navy }]}
              >
                Xərc Tarixçəsi ({expenses.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ExpenseItemCard
              expense={item}
              onEdit={() => openEditModal(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="cash-remove"
              title="Hələ xərc əlavə edilməyib"
              description="Səyahət xərclərini SQLite bazasına əlavə edərək büdcəyə nisbəti izləyin."
              actionLabel="Xərc Əlavə Et"
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
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text
                  variant="titleLarge"
                  style={{ color: colors.navy, fontWeight: '700' }}
                >
                  {editingExpense ? 'Xərci Redaktə Et' : 'Yeni Xərc Əlavə Et'}
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
                label="Xərcin adı"
                placeholder="məs. Otel ödənişi"
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
                    label="Məbləğ (AZN)"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(t) => {
                      setAmount(t);
                      if (errors.amount) {
                        setErrors((e) => ({ ...e, amount: undefined }));
                      }
                    }}
                    errorText={errors.amount}
                  />
                </View>

                <Pressable
                  style={[
                    styles.dateBox,
                    {
                      borderColor: errors.date ? colors.danger : colors.border,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  onPress={() => setDateModalVisible(true)}
                >
                  <Text variant="labelSmall" style={{ color: colors.muted }}>
                    Tarix
                  </Text>
                  <Text style={[styles.dateText, { color: colors.navy }]}>
                    {date}
                  </Text>
                </Pressable>
              </View>

              <Text
                variant="labelMedium"
                style={{ color: colors.muted, marginBottom: 8 }}
              >
                Kateqoriya
              </Text>
              <View style={styles.catGrid}>
                {EXPENSE_CATEGORIES.map((cat) => {
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
                        size={14}
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
                label="Qeyd (istəyə bağlı)"
                value={note}
                onChangeText={setNote}
              />

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
                  Yadda Saxla
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DateInputModal
        visible={dateModalVisible}
        title="Xərc Tarixini Seç"
        initialDate={date}
        onClose={() => setDateModalVisible(false)}
        onSelect={(iso) => {
          setDate(iso);
          setErrors((e) => ({ ...e, date: undefined }));
        }}
      />

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="Xərci silmək istəyirsiniz?"
        message={`"${deleteTarget?.title ?? ''}" xərc qeydi silinəcək.`}
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
  flex: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  headerBlock: {
    marginBottom: 8,
  },
  listTitle: {
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
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
    marginBottom: 14,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  dateBox: {
    width: 130,
    height: 54,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginTop: 4,
  },
  dateText: {
    fontWeight: '700',
    marginTop: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
});
