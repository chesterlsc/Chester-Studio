/** Icon names available in the HANDA icon set (src/design/icons/Icon.tsx). */
export const ICON_NAMES = [
  // nav
  'home', 'play', 'learn', 'inventory', 'profile', 'back', 'close', 'check', 'plus', 'minus', 'chevron', 'help', 'share', 'download', 'settings', 'globe', 'sun', 'moon', 'volume', 'volume-off', 'search', 'star', 'flag', 'warning', 'info', 'lock', 'external', 'calendar', 'clock', 'trash', 'edit', 'refresh', 'cloud', 'cloud-off', 'wifi-off', 'user', 'users', 'bell', 'print', 'qr',
  // scenarios
  'typhoon', 'flood', 'heat', 'brownout', 'water', 'earthquake', 'unrest', 'zombie',
  // categories
  'cat-water', 'cat-food', 'cat-canning', 'cat-medicine', 'cat-baby', 'cat-power', 'cat-shelter', 'cat-hygiene', 'cat-comms', 'cat-cash', 'cat-edc', 'cat-pets', 'cat-security',
  // household
  'adult', 'kid', 'baby', 'senior', 'pet', 'wheelchair',
  // content
  'book', 'tool', 'dumbbell', 'bulb', 'bandage', 'shield', 'phone', 'map', 'bag', 'radio', 'drop', 'bolt', 'fire', 'eye', 'ear', 'hand', 'footsteps', 'door', 'window', 'house-cut', 'trophy', 'medal', 'streak', 'card',
] as const;
export type IconName = typeof ICON_NAMES[number];
