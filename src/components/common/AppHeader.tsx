import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showDrawer?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  showDrawer = false,
  rightIcon,
  onRightPress,
}: Props) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLeftPress = () => {
    if (showBack) {
      router.back();
      return;
    }
    if (showDrawer) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {(showBack || showDrawer) && (
          <Pressable
            onPress={handleLeftPress}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceElevated,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={showBack ? 'arrow-left' : 'menu'}
              size={22}
              color={colors.navy}
            />
          </Pressable>
        )}

        <View style={styles.titleWrap}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: colors.navy }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              variant="bodySmall"
              style={{ color: colors.muted }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightIcon && onRightPress ? (
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: colors.surfaceElevated,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={rightIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={22}
            color={colors.primaryText}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
