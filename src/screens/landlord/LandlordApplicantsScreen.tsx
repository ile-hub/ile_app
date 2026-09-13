import { EmptyState } from '../../components/EmptyState';
import { ScreenContainer } from '../../components/ScreenContainer';

export function LandlordApplicantsScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="people-outline"
        subtitle="Applicants aren't connected yet. This is where you'll review renters who applied to your properties."
        title="No applicants yet"
      />
    </ScreenContainer>
  );
}
