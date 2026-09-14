import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';

// Placeholder shape for an application row, once there's an applications
// API to back it.
type ApplicationSummary = { id: string };

// Tracks status across everything applied to: submitted, shortlisted,
// rejected, accepted. No applications API exists yet, so this is the real
// empty state rather than status buckets with nothing in them. Uses
// ListScreenContainer (FlatList) since this is an open-ended list once
// real data exists.
export function MyApplicationsScreen() {
  return (
    <ListScreenContainer<ApplicationSummary>
      ListEmptyComponent={
        <EmptyState
          icon="document-text-outline"
          subtitle="Applications you submit will show up here, with their status — submitted, shortlisted, rejected, or accepted."
          title="No applications yet"
        />
      }
      data={[]}
      keyExtractor={(item) => item.id}
      renderItem={() => null}
    />
  );
}
