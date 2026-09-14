import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Pressable } from 'react-native';

import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertiesList'>;

// Placeholder shape for a property row, once there's a properties API to
// back it.
type PropertySummary = { id: string };

// No properties API exists yet, so this is the real empty state — but the
// "+" to add one is real navigation, ready for whenever listing a property
// actually persists somewhere. Uses ListScreenContainer (FlatList) since
// this is an open-ended list once real data exists.
export function PropertiesListScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => navigation.navigate('AddEditProperty', {})}
        >
          <Ionicons color={colors.accent} name="add-circle-outline" size={26} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <ListScreenContainer<PropertySummary>
      ListEmptyComponent={
        <EmptyState
          actionLabel="Add a property"
          icon="business-outline"
          onAction={() => navigation.navigate('AddEditProperty', {})}
          subtitle="Add your first one to start receiving applicants."
          title="No properties yet"
        />
      }
      data={[]}
      keyExtractor={(item) => item.id}
      renderItem={() => null}
    />
  );
}
