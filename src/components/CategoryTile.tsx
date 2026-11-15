// src/components/CategoryTile.tsx
import { Pressable, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

type Props = { label: string; onPress?: () => void };

export default function CategoryTile({ label, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{ width: '48%', marginBottom: 16 }}>
      <View
        style={{
          height: 80,
          borderRadius: 28,
          backgroundColor: theme.colors.secondaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon source="shape-outline" size={44} color={theme.colors.outline} />
      </View>
      <Text variant="labelLarge" style={{ marginTop: 8, marginLeft: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}
