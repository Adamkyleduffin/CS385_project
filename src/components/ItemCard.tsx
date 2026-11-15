// src/components/ItemCard.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';

export default function ItemCard({ item }: { item: any }) {
  const theme = useTheme();
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  return (
    <Pressable
      style={{ width: '48%', marginBottom: 16 }}
      onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
    >
      <View
        style={{
          aspectRatio: 0.87,
          borderRadius: 28,
          backgroundColor: theme.colors.secondaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon source="shape-outline" size={64} color={theme.colors.outline} />
        <IconButton
          icon={liked ? 'heart' : 'heart-outline'}
          mode="contained"
          containerColor="#fff"
          size={18}
          onPress={() => setLiked(!liked)}
          style={{ position: 'absolute', right: 6, bottom: 6 }}
        />
      </View>
      <Text variant="labelLarge" style={{ marginTop: 8, marginLeft: 12 }}>
        {item.title}
      </Text>
      <Text variant="labelLarge" style={{ marginLeft: 12 }}>
        {item.condition} · {item.size}
      </Text>
    </Pressable>
  );
}
