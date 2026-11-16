// src/components/CarbonImpact.tsx
import { View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { estimateImpact } from '../lib/carbon';

type Props = {
  /** The item's sub-category, e.g. "Outerwear". */
  subcategory: string;
};

/**
 * Shows the estimated carbon saving and points for swapping an item, e.g.
 * "Saves ~15.5 kg CO₂e · Earns 155 points".
 *
 * Renders nothing if the sub-category isn't supported, because showing no estimate is
 * better than showing a wrong one. The numbers come from {@link estimateImpact}, so the
 * screen never does its own maths.
 */
export default function CarbonImpact({ subcategory }: Props) {
  const theme = useTheme();
  const impact = estimateImpact(subcategory);

  if (!impact) return null;

  return (
    <View
      accessible
      accessibilityLabel={`Swapping this item saves about ${impact.kgCo2e} kilograms of CO2 equivalent and earns ${impact.points} points`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        backgroundColor: theme.colors.secondaryContainer,
      }}
    >
      <Icon source="leaf" size={28} color={theme.colors.onSecondaryContainer} />
      <View style={{ flex: 1 }}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSecondaryContainer }}>
          Saves ~{impact.kgCo2e} kg CO₂e · Earns {impact.points} points
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
          Estimated saving compared with buying this item new
        </Text>
      </View>
    </View>
  );
}
