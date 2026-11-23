import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Təsdiq et',
  cancelLabel = 'Ləğv et',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.card,
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
            variant="bodyMedium"
            style={[styles.message, { color: colors.muted }]}
          >
            {message}
          </Text>

          <View style={styles.actions}>
            <Button mode="text" onPress={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              mode="contained"
              buttonColor={destructive ? colors.danger : colors.primary}
              onPress={onConfirm}
            >
              {confirmLabel}
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
    padding: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
});
