// src/components/StatCard.tsx
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = {
  value: string;
  label: string;
  title?: string;
  unit?: string;
  wide?: boolean;
};

export default function StatCard({ value, label, title, unit, wide }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: wide ? '100%' : '48%',
        minHeight: wide ? 120 : 120,
        borderRadius: 28,
        backgroundColor: theme.colors.secondaryContainer,
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: title ? 'flex-start' : 'flex-end',
      }}
    >
      {title && (
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
        <Text
          style={{
            fontSize: wide ? 56 : 44,
            lineHeight: wide ? 64 : 52,
            color: theme.colors.onSurface,
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            variant="labelSmall"
            style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}
          >
            {unit}
          </Text>
        )}
      </View>

      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}
