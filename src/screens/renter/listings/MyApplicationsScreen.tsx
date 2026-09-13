import { EmptyState } from '../../../components/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer';

// Tracks status across everything applied to: submitted, shortlisted,
// rejected, accepted. No applications API exists yet, so this is the
// real empty state rather than status buckets with nothing in them.
export function MyApplicationsScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="document-text-outline"
        subtitle="Applications you submit will show up here, with their status — submitted, shortlisted, rejected, or accepted."
        title="No applications yet"
      />
    </ScreenContainer>
  );
}
