import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '../../components/haptic-tab';

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        animation: 'shift',
        sceneStyle: { backgroundColor: '#fff' },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarStyle: {
          position: 'absolute',
          bottom: bottom + 16,
          left: 80,
          right: 80,
          height: 58,
          backgroundColor: '#111',
          borderTopWidth: 0,
          borderRadius: 100,
          paddingBottom: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          borderRadius: 100,
          marginVertical: 8,
          marginHorizontal: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-sharp" color={color} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routine',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="book-sharp" color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finanças',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="cash-sharp" color={color} />,
        }}
      />
    </Tabs>
  );
}
