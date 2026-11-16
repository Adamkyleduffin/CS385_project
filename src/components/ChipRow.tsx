import { Pressable, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = { options: string[]; active: string; onSelect: (o: string) => void };

export default function ChipRow({ options, active, onSelect }: Props) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}
    >
      {options.map((o) => {
        const on = o === active;
        return (
          <Pressable
            key={o}
            onPress={() => onSelect(o)}
            style={{
              height: 36,
              paddingHorizontal: 16,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: on ? theme.colors.primary : theme.colors.outline,
              backgroundColor: on ? theme.colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              variant="labelLarge"
              style={{ color: on ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}
            >
              {o}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
