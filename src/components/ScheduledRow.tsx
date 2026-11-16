// src/components/ScheduledRow.tsx
import { View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import Thumbnail from './Thumbnail';

type Props = {
  entry: any;
  onComplete?: () => void;
  onReschedule?: () => void;
};

export default function ScheduledRow({ entry, onComplete, onReschedule }: Props) {
  return (
    <View>
      <View style={{ flexDirection: 'row', padding: 16, gap: 16 }}>
        <Thumbnail />

        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">{entry.user}</Text>
          <View style={{ marginTop: 8, gap: 2 }}>
            <Text variant="bodySmall">Item: {entry.itemName}</Text>
            <Text variant="bodySmall">Location: {entry.location}</Text>
            <Text variant="bodySmall">Time: {entry.time}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Button
              mode="contained-tonal"
              compact
              onPress={onComplete}
              labelStyle={{ fontSize: 12 }}
            >
              Mark Complete
            </Button>
            <Button
              mode="contained-tonal"
              compact
              onPress={onReschedule}
              labelStyle={{ fontSize: 12 }}
            >
              Reschedule
            </Button>
          </View>
        </View>
      </View>
      <Divider />
    </View>
  );
}
