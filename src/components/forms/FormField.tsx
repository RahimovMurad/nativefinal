import { StyleSheet, View } from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

import { useAppTheme } from '@/context/ThemeContext';

type Props = TextInputProps & {
  errorText?: string;
};

export function FormField({ errorText, style, ...props }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <TextInput
        mode="outlined"
        error={Boolean(errorText)}
        outlineColor={colors.border}
        activeOutlineColor={colors.primaryText}
        textColor={colors.navy}
        placeholderTextColor={colors.muted}
        style={[{ backgroundColor: colors.surface }, style]}
        {...props}
      />
      {errorText ? (
        <HelperText type="error" visible={Boolean(errorText)}>
          {errorText}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
});
