import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';

// Placeholder shape for a matched-listing row, once there's a matching API
// to back it. Kept minimal since nothing populates it yet.
type ListingSummary = { id: string };

// Browse tab: matched properties with a compatibility % per card, once
// there's a matching engine behind it. No listings API exists yet, so this
// shows the real "nothing to show" state rather than fabricated cards —
// the compatibility breakdown lives on PropertyDetailScreen once a card
// exists to tap into. Uses ListScreenContainer (FlatList) rather than
// ScreenContainer since this is an open-ended list once real data exists.
//
// Tracking submitted applications separately (a "My Applications" screen)
// was removed — the mutual-interest flow (Interested → Matched tab) already
// covers "where do I stand with this property," and having both was two
// places to check the same thing.
export function ListingsScreen() {
  return (
    <ListScreenContainer<ListingSummary>
      ListEmptyComponent={
        <EmptyState
          icon="search-outline"
          subtitle="Once matching is connected, properties compatible with your trust profile will show up here with a compatibility score."
          title="No matches yet"
        />
      }
      data={[]}
      keyExtractor={(item) => item.id}
      renderItem={() => null}
    />
  );
}
