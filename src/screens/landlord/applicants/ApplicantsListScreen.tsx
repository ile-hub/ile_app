import { EmptyState } from '../../../components/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer';

// Across all properties, filterable by property once there are any.
// Trust profile + compatibility are meant to show together per row here
// (not as two disconnected views) — that pairing lives in
// ApplicantDetailScreen, reachable once there's a real applicant to tap.
export function ApplicantsListScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="people-outline"
        subtitle="Applicants to any of your properties will show up here, with their trust profile and compatibility together."
        title="No applicants yet"
      />
    </ScreenContainer>
  );
}
