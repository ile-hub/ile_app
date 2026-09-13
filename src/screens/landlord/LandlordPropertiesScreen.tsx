import { EmptyState } from '../../components/EmptyState';
import { ScreenContainer } from '../../components/ScreenContainer';

export function LandlordPropertiesScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="business-outline"
        subtitle="Properties aren't connected yet. This is where you'll list and manage the units you rent out."
        title="No properties yet"
      />
    </ScreenContainer>
  );
}
