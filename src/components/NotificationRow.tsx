// src/components/NotificationRow.tsx
import { Pressable, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';

type Props = { notification: any; onPress?: () => void };

export default function NotificationRow({ notification, onPress }: Props) {
  const theme = useTheme();
  const isRequest = notification.type === 'request';

  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={{ flexDirection: 'row', padding: 16, gap: 16 }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 4,
            backgroundColor: theme.colors.surfaceVariant,
          }}
        />

        <View style={{ flex: 1 }}>
          {isRequest ? (
            <Text variant="bodySmall">
              {notification.user} has requested to pick up your item.{'\n'}
              Tap to schedule collection!
            </Text>
          ) : (
            <Text variant="bodySmall">{notification.user} liked your item!</Text>
          )}
          <Text variant="labelSmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
            {notification.time}
          </Text>
        </View>
      </Pressable>
      <Divider />
    </View>
  );
}
