import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import type { RenterListingsStackParamList } from '../../../navigation/renter/RenterListingsStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterListingsStackParamList, 'ListingsMain'>;

// Placeholder shape for a matched-listing row, once there's a matching API
// to back it. Kept minimal since nothing populates it yet.
type ListingSummary = { id: string };

// Browse tab: matched properties with a compatibility % per card, once
// there's a matching engine behind it. No listings API exists yet, so this
// shows the real "nothing to show" state rather than fabricated cards —
// the compatibility breakdown lives on PropertyDetailScreen once a card
// exists to tap into. Uses ListScreenContainer (FlatList) rather than
// ScreenContainer since this is an open-ended list once real data exists.
export function ListingsScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => navigation.navigate('MyApplications')}
        >
          <Text style={styles.headerAction}>My Applications</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

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

const styles = StyleSheet.create({
  headerAction: { color: colors.accent, fontSize: 14, fontWeight: '700' },
});
