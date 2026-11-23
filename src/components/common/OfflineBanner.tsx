import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  visible: boolean;
  message?: string;
};

export function OfflineBanner({
  visible,
  message = 'Offline rejim: lokal SQLite / keşlənmiş məlumatlar göstərilir',
}: Props) {
  const { colors } = useAppTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.warningSoft,
          borderColor: colors.warning,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="wifi-off"
        size={18}
        color={colors.warning}
      />
      <Text
        variant="bodySmall"
        style={[styles.text, { color: colors.navy }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  text: {
    flex: 1,
    fontWeight: '600',
  },
});
