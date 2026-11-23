import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';
import type { JournalEntry } from '@/types';
import { formatShortDate } from '@/utils/format';

type Props = {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
};

export function JournalEntryCard({ entry, onEdit, onDelete }: Props) {
  const { colors } = useAppTheme();
  const datePart = entry.createdAt.slice(0, 10);

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
      {entry.imageUri ? (
        <Image source={{ uri: entry.imageUri }} style={styles.photo} />
      ) : null}

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.locChip,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={13}
              color={colors.primaryText}
            />
            <Text style={[styles.locText, { color: colors.primaryText }]}>
              {entry.locationName}
            </Text>
          </View>

          <Text variant="labelSmall" style={{ color: colors.muted }}>
            {formatShortDate(datePart)}
          </Text>
        </View>

        <Text
          variant="titleMedium"
          style={[styles.title, { color: colors.navy }]}
        >
          {entry.title}
        </Text>

        {entry.tripTitle ? (
          <Text
            variant="labelSmall"
            style={{ color: colors.success, fontWeight: '600', marginTop: 2 }}
          >
            Səyahət: {entry.tripTitle}
          </Text>
        ) : null}

        <Text
          variant="bodyMedium"
          style={[styles.content, { color: colors.muted }]}
        >
          {entry.content}
        </Text>

        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <Pressable onPress={onEdit} style={styles.actionBtn}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.actionTxt, { color: colors.primary }]}>
              Redaktə et
            </Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.actionBtn}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
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
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  photo: {
    width: '100%',
    height: 185,
  },
  body: {
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  locText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontWeight: '700',
    marginTop: 8,
  },
  content: {
    marginTop: 6,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
});
