// src/components/Thumbnail.tsx
import { View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

export default function Thumbnail() {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 52,
        height: 56,
        borderRadius: 4,
        backgroundColor: theme.colors.surfaceVariant,
      }}
    >
      <View
        style={{
          position: 'absolute',
          right: -8,
          bottom: -8,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: theme.colors.primaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon source="account-outline" size={14} color={theme.colors.primary} />
      </View>
    </View>
  );
}
