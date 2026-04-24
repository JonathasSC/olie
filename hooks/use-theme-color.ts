import { Colors } from '@/constants/design';

const FALLBACKS: Record<string, string> = {
  text:           Colors.t1,
  background:     Colors.bg,
  tint:           Colors.brand,
  icon:           Colors.t2,
  tabIconDefault: Colors.t3,
  tabIconSelected: Colors.brand,
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string,
) {
  // Always dark — return override if provided, else fallback from design system.
  return props.dark ?? props.light ?? FALLBACKS[colorName] ?? Colors.t1;
}
