import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import type { CategoryMeta } from '@/constants/categories';
import { useAppTheme } from '@/context/ThemeContext';

type Props<T extends string> = {
  items: CategoryMeta<T>[];
  selected: T;
  onSelect: (key: T) => void;
};

export function CategoryChips<T extends string>({
  items,
  selected,
  onSelect,
}: Props<T>) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item) => {
        const isActive = item.key === selected;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={16}
              color={isActive ? '#FFFFFF' : item.color}
            />
            <Text
              variant="labelMedium"
              style={{
                color: isActive ? '#FFFFFF' : colors.navy,
                fontWeight: isActive ? '700' : '600',
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
