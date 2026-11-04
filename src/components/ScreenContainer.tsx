import { useEffect, useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
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
// ListScreenContainer's FlatList instead, so the list can virtualize. A
// plain ScrollView here would otherwise end up
// with a FlatList nested inside it, which React Native explicitly warns
// against and which breaks windowing.
export function ScreenContainer({ children, resetKey, onRefresh, refreshing = false }: { children: ReactNode; resetKey?: string; onRefresh?: () => void; refreshing?: boolean }) {
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [resetKey]);
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView
          ref={scroll}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustKeyboardInsets={false}
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

// Shared content typography/layout for the MVP screens.
export const screenStyles = StyleSheet.create({
  content: { gap: 16 },
  title: { color: colors.textPrimary, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, fontWeight: '800' },
  heading: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 12 },
  body: { color: colors.textSecondary, fontSize: 15, lineHeight: 23 },
  note: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
