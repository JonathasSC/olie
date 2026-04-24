import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (ev: any) => {
    // Haptics funciona em Android e iOS se o dispositivo suportar
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    scale.value = withSpring(0.90, { 
      damping: 15, 
      stiffness: 300 
    });
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    scale.value = withSpring(1);
    props.onPressOut?.(ev);
  };

  return (
    <PlatformPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[props.style, { flex: 1 }]}
    >
      <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}
