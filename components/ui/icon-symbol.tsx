// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'xmark': 'close',

  // tabs
  'calendar.fill': 'event',
  'dollarsign.circle.fill': 'account-balance-wallet',
  'list.bullet': 'format-list-bulleted',

  // actions
  'plus': 'add',
  'square.and.pencil': 'edit',
  'trash': 'delete',

  // search
  'magnifyingglass': 'search',

  // insights / misc
  'lightbulb.fill': 'lightbulb',
  'note.text': 'description',
  'clock.fill': 'schedule',

  // categorias de gasto
  'fork.knife': 'restaurant',
  'car.fill': 'directions-car',
  'doc.text.fill': 'receipt',
  'sparkles': 'auto-awesome',

  // categorias de ganho
  'briefcase.fill': 'work',
  'laptopcomputer': 'laptop',
  'gift.fill': 'card-giftcard',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
