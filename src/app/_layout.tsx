// src/app/_layout.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { PaperProvider, useTheme } from 'react-native-paper';
import { paperTheme } from '../constants/paperTheme';

const tabs = [
  { name: 'index', title: 'Home', icon: 'home-outline' },
  { name: 'browse', title: 'Browse', icon: 'dots-grid' },
  { name: 'list', title: 'List', icon: 'plus-box-outline' },
  { name: 'wardrobe', title: 'Wardrobe', icon: 'briefcase-outline' },
  { name: 'profile', title: 'Profile', icon: 'chart-box-outline' },
] as const;

function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.primary,
        tabBarStyle: { backgroundColor: t.colors.elevation.level2 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
      <Tabs.Screen
        name="item/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <TabsLayout />
    </PaperProvider>
  );
}
