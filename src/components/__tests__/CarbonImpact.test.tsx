import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import CarbonImpact from '../CarbonImpact';
import { estimateImpact } from '../../lib/carbon';

/** Paper components need the theme provider, just like in the app. */
async function renderWithTheme(subcategory: string) {
  return render(
    <PaperProvider>
      <CarbonImpact subcategory={subcategory} />
    </PaperProvider>,
  );
}

describe('CarbonImpact', () => {
  it('shows the kg CO₂e and points from the calculator', async () => {
    await renderWithTheme('Outerwear');
    const { kgCo2e, points } = estimateImpact('Outerwear')!;

    expect(screen.getByText(`Saves ~${kgCo2e} kg CO₂e · Earns ${points} points`)).toBeTruthy();
  });

  it('has an accessibility label for screen readers', async () => {
    await renderWithTheme('Tops');
    const { kgCo2e, points } = estimateImpact('Tops')!;

    expect(
      screen.getByLabelText(
        `Swapping this item saves about ${kgCo2e} kilograms of CO2 equivalent and earns ${points} points`,
      ),
    ).toBeTruthy();
  });

  it('renders nothing for an unsupported sub-category', async () => {
    await renderWithTheme('Hats');

    expect(screen.queryByText(/kg CO₂e/)).toBeNull();
  });
});
