import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { EmptyState } from './EmptyState';

export function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

// Same visual shell as EmptyState, so a failed load looks like part of the
// app rather than a crash, with a retry.
export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <EmptyState
      actionLabel="Try again"
      icon="cloud-offline-outline"
      onAction={onRetry}
      subtitle={error.message}
      title="Something went wrong"
    />
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: 48 },
});

// UI state only, not a proposed API response shape.
export type ContentState =
  | { kind: 'loading' }
  | { kind: 'empty'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error'; error: Error; onRetry: () => void };

export function ContentStateView({ state }: { state: ContentState }) {
  if (state.kind === 'loading') return <LoadingState />;
  if (state.kind === 'error') return <ErrorState error={state.error} onRetry={state.onRetry} />;
  return <EmptyState icon={state.kind === 'unavailable' ? 'time-outline' : 'people-outline'}
    title={state.kind === 'unavailable' ? 'Not available yet' : 'Nothing here yet'}
    subtitle={state.message} />;
}
