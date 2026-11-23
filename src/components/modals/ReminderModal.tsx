import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  visible: boolean;
  tripTitle: string;
  startDate: string;
  statusMessage: string | null;
  onClose: () => void;
  onSchedule: () => void;
};

export function ReminderModal({
  visible,
  tripTitle,
  startDate,
  statusMessage,
  onClose,
  onSchedule,
}: Props) {
  const { colors } = useAppTheme();

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
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => {}}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={30}
              color={colors.primaryText}
            />
          </View>

          <Text
            variant="titleMedium"
            style={[styles.title, { color: colors.navy }]}
          >
            Səyahət Xatırlatması
          </Text>

          <Text
            variant="bodyMedium"
            style={[styles.desc, { color: colors.muted }]}
          >
            "{tripTitle}" səyahəti ({startDate}) üçün lokal xatırlatma bildirişi
            quraşdırın.
          </Text>

          {statusMessage ? (
            <View
              style={[
                styles.statusBox,
                { backgroundColor: colors.successSoft },
              ]}
            >
              <Text style={[styles.statusText, { color: colors.success }]}>
                {statusMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button mode="text" onPress={onClose}>
              Bağla
            </Button>
            <Button mode="contained" icon="bell-plus" onPress={onSchedule}>
              Xatırlatma Qur
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusBox: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
});
