import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

// For content/detail/form screens — scrollable so nothing gets cut off
// past one page, and keyboard-avoiding so a focused field near the bottom
// of a form isn't left under the keyboard. flexGrow: 1 on the content
// keeps flex:1 / marginTop: 'auto' children (EmptyState, the logout
// button, ...) centering or bottom-pinning correctly when content is
// short, while still scrolling normally once it's not.
//
// Not for screens whose content is an open-ended, potentially-long list of
// rows (properties, listings, applicants, applications) — those should use
// ListScreenContainer's FlatList instead, so the list can virtualize once
// it's backed by real data. A plain ScrollView here would otherwise end up
// with a FlatList nested inside it, which React Native explicitly warns
// against and which breaks windowing.
export function ScreenContainer({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, padding: 24 },
});
