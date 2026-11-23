import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { getExpenseCategoryMeta } from '@/constants/categories';
import { useAppTheme } from '@/context/ThemeContext';
import type { Expense } from '@/types';
import { formatShortDate, money } from '@/utils/format';

type Props = {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
};

export function ExpenseItemCard({ expense, onEdit, onDelete }: Props) {
  const { colors } = useAppTheme();
  const meta = getExpenseCategoryMeta(expense.category);

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
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}1A` }]}>
        <MaterialCommunityIcons
          name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={22}
          color={meta.color}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            variant="titleSmall"
            style={[styles.title, { color: colors.navy }]}
            numberOfLines={1}
          >
            {expense.title}
          </Text>
          <Text
            variant="titleSmall"
            style={[styles.amount, { color: colors.primary }]}
          >
            {money(expense.amount)}
          </Text>
        </View>

        <Text variant="bodySmall" style={{ color: colors.muted }}>
          {meta.label} • {formatShortDate(expense.date)}
        </Text>

        {expense.note ? (
          <Text
            variant="bodySmall"
            style={[styles.note, { color: colors.muted }]}
            numberOfLines={1}
          >
            {expense.note}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable onPress={onEdit} style={styles.actionBtn}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={15}
              color={colors.primary}
            />
            <Text style={[styles.actionTxt, { color: colors.primary }]}>
              Redaktə
            </Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.actionBtn}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={15}
              color={colors.danger}
            />
            <Text style={[styles.actionTxt, { color: colors.danger }]}>Sil</Text>
          </Pressable>
        </View>
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
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
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
  amount: {
    fontWeight: '800',
  },
  note: {
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
});
