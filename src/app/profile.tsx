// src/app/profile.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useCarbonSummary } from '../api/carbon';
import NotificationRow from '../components/NotificationRow';
import ReviewRow from '../components/ReviewRow';
import StarRating from '../components/StarRating';
import StatCard from '../components/StatCard';
import TopBar from '../components/TopBar';
import TopTabs from '../components/TopTabs';
import { notifications, reviews, user } from '../constants/mockData';

const sections = ['Dashboard', 'Reviews', 'Notifications'];

export default function Profile() {
  const theme = useTheme();
  const router = useRouter();
  const [section, setSection] = useState('Dashboard');
  // Carbon totals come from the data layer (mock ledger now, Supabase later).
  const { data: carbon } = useCarbonSummary(user.username);

  return (
    <View style={{ flex: 1 }}>
      <TopBar title="Profile" leftIcon="menu" showAvatar />
      <TopTabs tabs={sections} active={section} onSelect={setSection} />

      {section === 'Dashboard' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
            Hello, @{user.username}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: 16,
            }}
          >
            <StatCard
              wide
              title="Total Points"
              value={carbon.points.toLocaleString()}
              label="Carbon Points Generated"
            />
            <StatCard value={String(carbon.itemsGiven)} label="Items Donated" />
            <StatCard value={user.reviewAverage.toFixed(1)} label="Review Average" />
            <StatCard value={String(carbon.kgCo2e)} unit="kg CO₂e" label="Saved from environment" />
          </View>
        </ScrollView>
      )}

      {section === 'Reviews' && (
        <FlatList
          data={reviews}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <ReviewRow review={item} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontSize: 48, lineHeight: 56 }}>{user.reviewAverage.toFixed(1)}</Text>
              <View style={{ marginTop: 4 }}>
                <StarRating rating={user.reviewAverage} size={24} />
              </View>
              <Text
                variant="bodySmall"
                style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}
              >
                ({user.reviewCount})
              </Text>
            </View>
          }
        />
      )}

      {section === 'Notifications' && (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <NotificationRow
              notification={item}
              onPress={item.type === 'request' ? () => router.push('/wardrobe') : undefined}
            />
          )}
        />
      )}
    </View>
  );
}
