import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  readOnlyTrigger?: boolean;
  onPressTrigger?: () => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Ölkə, şəhər və ya məkan axtar...',
  readOnlyTrigger = false,
  onPressTrigger,
  autoFocus = false,
  onSubmit,
}: Props) {
  const { colors } = useAppTheme();

  if (readOnlyTrigger && onPressTrigger) {
    return (
      <Pressable
        onPress={onPressTrigger}
        style={({ pressed }) => [
          styles.wrapper,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.muted}
        />
        <TextInput
          editable={false}
          pointerEvents="none"
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.navy }]}
        />
        <View
          style={[styles.filterBadge, { backgroundColor: colors.primaryLight }]}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={16}
            color={colors.primaryText}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        style={[styles.input, { color: colors.navy }]}
      />
      {value.length > 0 && onChangeText ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={colors.muted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
