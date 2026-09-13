import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Pressable } from 'react-native';

import { EmptyState } from '../../../components/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertiesList'>;

// No properties API exists yet, so this is the real empty state — but the
// "+" to add one is real navigation, ready for whenever listing a property
// actually persists somewhere.
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
    <ScreenContainer>
      <EmptyState
        icon="business-outline"
        subtitle="Add your first property to start managing it and reviewing applicants."
        title="No properties yet"
      />
    </ScreenContainer>
  );
}
