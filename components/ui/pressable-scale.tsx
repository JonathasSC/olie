import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleTo?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  scaleTo = 0.95,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (ev: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(scaleTo, {
      damping: 15,
      stiffness: 300,
    });
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    scale.value = withSpring(1);
    props.onPressOut?.(ev);
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
