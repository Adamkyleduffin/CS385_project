/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // React Native 0.88 (SDK 58) returns null when no scheme is set, so fall back to light.
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
