import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'compass-off-outline',
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}
      >
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={36}
          color={colors.primaryText}
        />
      </View>
      <Text
        variant="titleMedium"
        style={[styles.title, { color: colors.navy }]}
      >
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.desc, { color: colors.muted }]}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.btn}
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  btn: {
    marginTop: 18,
    borderRadius: 12,
  },
});
