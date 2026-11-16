// src/components/StarRating.tsx
import { View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

type Props = { rating: number; size?: number };

export default function StarRating({ rating, size = 12 }: Props) {
  const theme = useTheme();
  const rounded = Math.round(rating * 2) / 2; // nearest half star

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const icon = rounded >= i ? 'star' : rounded >= i - 0.5 ? 'star-half-full' : 'star-outline';
        const filled = rounded >= i - 0.5;
        return (
          <Icon
            key={i}
            source={icon}
            size={size}
            color={filled ? theme.colors.primary : theme.colors.outlineVariant}
          />
        );
      })}
    </View>
  );
}
