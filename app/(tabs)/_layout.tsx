import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, TAB_HEIGHT } from '@/constants/design';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.t3,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.bdr,
          borderTopWidth: 1,
          height: TAB_HEIGHT,
          paddingBottom: Platform.OS === 'android' ? 10 : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: Colors.bgCard }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 52, height: 30, borderRadius: 15,
              backgroundColor: focused ? Colors.brandDim : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <IconSymbol size={22} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 52, height: 30, borderRadius: 15,
              backgroundColor: focused ? Colors.brandDim : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <IconSymbol size={22} name="checkmark.circle.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finanças',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 52, height: 30, borderRadius: 15,
              backgroundColor: focused ? Colors.brandDim : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <IconSymbol size={22} name="wallet.pass.fill" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
