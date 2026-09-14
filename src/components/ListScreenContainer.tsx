import { FlatList, StyleSheet, type FlatListProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

// For screens whose content is an open-ended, potentially-long list of rows
// — properties, listings, applicants, applications. Uses FlatList so the
// list virtualizes once it's backed by real data, instead of ScreenContainer's
// ScrollView (which would nest a FlatList inside a ScrollView — React Native
// warns against exactly that, and it breaks windowing/performance).
//
// Pass ListHeaderComponent for anything that should scroll away with the
// list (filter chips, a subtitle) and ListEmptyComponent (typically
// <EmptyState .../>) for the empty state — same visual shell as
// ScreenContainer otherwise, so screens look consistent regardless of which
// one they use.
export function ListScreenContainer<T>(props: FlatListProps<T>) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, padding: 24 },
});
