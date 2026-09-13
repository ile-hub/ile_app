import { EmptyState } from '../../../components/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer';

// Completed tenancies across your properties, plus outcome recording for
// ones that recently ended. No tenancy-history API exists yet.
export function TenancyHistoryScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="time-outline"
        subtitle="Completed tenancies across your properties will show up here, and we'll prompt you to record the outcome shortly after one ends."
        title="No tenancy history yet"
      />
    </ScreenContainer>
  );
}
