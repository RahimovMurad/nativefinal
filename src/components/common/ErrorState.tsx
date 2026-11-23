import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Məlumat yüklənmədi',
  message,
  onRetry,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconBox, { backgroundColor: colors.dangerSoft }]}
      >
        <MaterialCommunityIcons
          name="cloud-alert"
          size={36}
          color={colors.danger}
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
        style={[styles.message, { color: colors.muted }]}
      >
        {message}
      </Text>
      {onRetry ? (
        <Button
          mode="contained"
          icon="refresh"
          onPress={onRetry}
          buttonColor={colors.primary}
          style={styles.btn}
        >
          Yenidən cəhd et
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
  message: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 18,
    borderRadius: 12,
  },
});
