// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // navigation
  'house.fill':                            'home',
  'chevron.right':                         'chevron-right',
  'chevron.left':                          'chevron-left',
  'chevron.down':                          'keyboard-arrow-down',
  'chevron.left.forwardslash.chevron.right': 'code',
  'xmark':                                 'close',

  // tabs
  'checkmark.circle.fill':                 'check-circle',
  'wallet.pass.fill':                      'account-balance-wallet',
  'calendar.fill':                         'event',
  'list.bullet':                           'format-list-bulleted',

  // actions
  'plus':                                  'add',
  'plus.circle.fill':                      'add-circle',
  'pencil':                                'edit',
  'square.and.pencil':                     'edit',
  'trash':                                 'delete',
  'paperplane.fill':                       'send',
  'square.and.arrow.up':                   'file-upload',
  'square.and.arrow.down':                 'file-download',
  'gearshape.fill':                        'settings',

  // status / feedback
  'checkmark':                             'check',
  'checkmark.circle':                      'check-circle-outline',
  'wallet.pass':                           'account-balance-wallet',

  // search
  'magnifyingglass':                       'search',

  // finance
  'arrow.up':                              'arrow-upward',
  'arrow.down':                            'arrow-downward',
  'banknote.fill':                         'payments',
  'dollarsign.circle.fill':               'attach-money',
  'cart.fill':                             'shopping-cart',

  // insights / misc
  'lightbulb.fill':                        'lightbulb',
  'note.text':                             'description',
  'clock.fill':                            'schedule',
  'person.fill':                           'person',
  'repeat':                                'repeat',

  // expense categories
  'fork.knife':                            'restaurant',
  'car.fill':                              'directions-car',
  'doc.text.fill':                         'receipt',
  'sparkles':                              'auto-awesome',
  'heart.fill':                            'favorite',
  'antenna.radiowaves.left.and.right':     'rss-feed',
  'ellipsis.circle.fill':                  'more-horiz',

  // income categories
  'briefcase.fill':                        'work',
  'laptopcomputer':                        'laptop',
  'gift.fill':                             'card-giftcard',
} as unknown as IconMapping;

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
