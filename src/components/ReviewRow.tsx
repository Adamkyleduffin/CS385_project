// src/components/ReviewRow.tsx
import { View } from 'react-native';
import { Avatar, Divider, Text, useTheme } from 'react-native-paper';
import StarRating from './StarRating';

export default function ReviewRow({ review }: { review: any }) {
  const theme = useTheme();

  return (
    <View>
      <View style={{ flexDirection: 'row', padding: 16, gap: 16 }}>
        <Avatar.Icon
          size={40}
          icon="account-outline"
          color={theme.colors.primary}
          style={{ backgroundColor: theme.colors.primaryContainer }}
        />

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="labelLarge">{review.user}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {review.time}
            </Text>
          </View>

          <View style={{ marginTop: 4 }}>
            <StarRating rating={review.rating} size={10} />
          </View>

          <Text variant="bodySmall" style={{ marginTop: 6 }}>
            {review.comment}
          </Text>
        </View>
      </View>
      <Divider />
    </View>
  );
}
