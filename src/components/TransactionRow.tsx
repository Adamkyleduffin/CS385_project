// src/components/TransactionRow.tsx
import { View } from 'react-native';
import { Button, Divider, Icon, Text, useTheme } from 'react-native-paper';
import Thumbnail from './Thumbnail';

type Props = { transaction: any; onReview?: () => void };

export default function TransactionRow({ transaction, onReview }: Props) {
  const theme = useTheme();

  return (
    <View>
      <View style={{ flexDirection: 'row', padding: 16, gap: 16 }}>
        <Thumbnail />

        <View style={{ flex: 1 }}>
          <Text variant="labelLarge">You donated to {transaction.recipient}</Text>
          <Text variant="bodySmall" style={{ marginTop: 12 }}>
            Item: {transaction.itemName}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 4 }}>
            Date: {transaction.date}
          </Text>

          <View style={{ marginTop: 12 }}>
            {transaction.feedback ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon source="star-circle" size={20} color={theme.colors.primary} />
                <Text variant="labelMedium">Positive feedback received!</Text>
              </View>
            ) : (
              <Button
                mode="contained-tonal"
                compact
                onPress={onReview}
                style={{ alignSelf: 'flex-start' }}
                labelStyle={{ fontSize: 12 }}
              >
                Leave Review
              </Button>
            )}
          </View>
        </View>
      </View>
      <Divider />
    </View>
  );
}
