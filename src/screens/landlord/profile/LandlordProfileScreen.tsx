import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AccountProfileScreen } from '../../../components/AccountProfileScreen';
import type { LandlordProfileStackParamList } from '../../../navigation/landlord/LandlordProfileStack';

type Props = NativeStackScreenProps<LandlordProfileStackParamList, 'LandlordProfileMain'>;

export function LandlordProfileScreen({ navigation }: Props) {
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
          key: 'tenancyHistory',
          label: 'Tenancy history',
          icon: 'time-outline',
          onPress: () => navigation.navigate('TenancyHistory'),
        },
      ]}
      roleLabel="Landlord"
    />
  );
}
