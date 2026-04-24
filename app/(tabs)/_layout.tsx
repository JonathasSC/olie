import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
          borderTopColor: isDark ? '#161616' : '#E8EEF4',
          borderTopWidth: 1.5,
          elevation: 0,
          height: Platform.OS === 'android' ? 68 : 60,
          paddingBottom: Platform.OS === 'android' ? 12 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rotina"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="financas"
        options={{
          title: 'Finanças',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="dollarsign.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
