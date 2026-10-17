import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { LandlordTabParamList } from '../../../navigation/landlord/LandlordTabNavigator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProfileEditor } from '../../../components/ProfileEditor';
import { useAuth } from '../../../auth/AuthProvider';
import { AccountProfileScreen } from '../../../components/AccountProfileScreen';
import type { LandlordProfileStackParamList } from '../../../navigation/landlord/LandlordProfileStack';

type Props = NativeStackScreenProps<LandlordProfileStackParamList, 'LandlordProfileMain'>;

export function LandlordProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  return (
    <AccountProfileScreen
      menuItems={[
        {
          key: 'verification',
          label: 'Verification',
          icon: 'shield-checkmark-outline',
          onPress: () => navigation.navigate('LandlordVerification'),
        },
        {
          key: 'preview', label: 'View public profile and properties', icon: 'eye-outline',
          onPress: () => navigation.getParent<BottomTabNavigationProp<LandlordTabParamList>>()?.navigate('LandlordDiscoverTab', { screen: 'LandlordProfile', initial: false, params: { landlordId: user?.id } }),
        },
      ]}
      roleLabel="Landlord"
    ><ProfileEditor role="landlord" /></AccountProfileScreen>
  );
}
