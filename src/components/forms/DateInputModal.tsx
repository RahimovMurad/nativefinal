import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import { addDaysIso } from '@/utils/dateUtils';
import { formatShortDate, isIsoDate, localToday } from '@/utils/format';

type Props = {
  visible: boolean;
  title: string;
  initialDate: string;
  onClose: () => void;
  onSelect: (isoDate: string) => void;
};

export function DateInputModal({
  visible,
  title,
  initialDate,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useAppTheme();
  const [value, setValue] = useState(initialDate || localToday());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(isIsoDate(initialDate) ? initialDate : localToday());
      setError(null);
    }
  }, [visible, initialDate]);

  const stepDays = (days: number) => {
    const base = isIsoDate(value) ? value : localToday();
    setValue(addDaysIso(base, days));
    setError(null);
  };

  const handleConfirm = () => {
    if (!isIsoDate(value.trim())) {
      setError('Tarix formatı YYYY-MM-DD olmalıdır (məs. 2026-12-05)');
      return;
    }
    onSelect(value.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => {}}
        >
          <Text
            variant="titleMedium"
            style={[styles.title, { color: colors.navy }]}
          >
            {title}
          </Text>

          <Text
            variant="bodySmall"
            style={[styles.preview, { color: colors.primary }]}
          >
            {isIsoDate(value) ? formatShortDate(value) : 'Yanlış tarix formatı'}
          </Text>

          <TextInput
            mode="outlined"
            label="Tarix (YYYY-MM-DD)"
            value={value}
            onChangeText={(t) => {
              setValue(t);
              setError(null);
            }}
            placeholder="2026-12-05"
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.navy}
            style={{ backgroundColor: colors.surface }}
          />

          {error ? (
            <Text style={[styles.err, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <View style={styles.quickRow}>
            <Button
              compact
              mode="outlined"
              onPress={() => setValue(localToday())}
            >
              Bu gün
            </Button>
            <Button compact mode="outlined" onPress={() => stepDays(-1)}>
              -1 gün
            </Button>
            <Button compact mode="outlined" onPress={() => stepDays(1)}>
              +1 gün
            </Button>
            <Button compact mode="outlined" onPress={() => stepDays(5)}>
              +5 gün
            </Button>
          </View>

          <View style={styles.footer}>
            <Button mode="text" onPress={onClose}>
              Ləğv et
            </Button>
            <Button mode="contained" onPress={handleConfirm}>
              Seç
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontWeight: '700',
  },
  preview: {
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  err: {
    fontSize: 12,
    marginTop: 6,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
});
