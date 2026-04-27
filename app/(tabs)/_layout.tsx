import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, TAB_HEIGHT } from '@/constants/design';

type TabIconName = 'house.fill' | 'checkmark.circle.fill' | 'wallet.pass.fill' | 'gearshape.fill';

function AnimatedTabIcon({ name, color, focused }: { name: TabIconName; color: string; focused: boolean }) {
  const scale = useSharedValue(focused ? 1 : 0.82);
  const pillOpacity = useSharedValue(focused ? 1 : 0);
  const pillScale = useSharedValue(focused ? 1 : 0.7);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.82, { damping: 14, stiffness: 280 });
    pillOpacity.value = withTiming(focused ? 1 : 0, { duration: 180 });
    pillScale.value = withSpring(focused ? 1 : 0.7, { damping: 16, stiffness: 300 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scaleX: pillScale.value }],
  }));

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <Animated.View style={iconStyle}>
        <IconSymbol size={22} name={name} color={color} />
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'android' ? 10 : 8;

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
          height: TAB_HEIGHT + insets.bottom,
          paddingBottom: bottomPad + insets.bottom,
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
            <AnimatedTabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Rotina',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="checkmark.circle.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finanças',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="wallet.pass.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="gearshape.fill" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 52,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: Colors.brandDim,
  },
});
