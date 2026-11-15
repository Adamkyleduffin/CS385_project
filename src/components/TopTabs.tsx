// src/components/TopTabs.tsx
import { Pressable, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = { tabs: string[]; active: string; onSelect: (t: string) => void };

export default function TopTabs({ tabs, active, onSelect }: Props) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceVariant,
      }}
    >
      {tabs.map((t) => {
        const on = t === active;
        return (
          <Pressable
            key={t}
            onPress={() => onSelect(t)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 2,
              borderBottomColor: on ? theme.colors.primary : 'transparent',
              marginBottom: -1,
            }}
          >
            <Text
              variant="labelLarge"
              style={{ color: on ? theme.colors.primary : theme.colors.onSurfaceVariant }}
            >
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
