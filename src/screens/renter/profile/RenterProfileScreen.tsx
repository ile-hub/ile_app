import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AccountProfileScreen } from '../../../components/AccountProfileScreen';
import type { RenterProfileStackParamList } from '../../../navigation/renter/RenterProfileStack';

type Props = NativeStackScreenProps<RenterProfileStackParamList, 'RenterProfileMain'>;

export function RenterProfileScreen({ navigation }: Props) {
  return (
    <AccountProfileScreen
      menuItems={[
        {
          key: 'verification',
          label: 'Verification status',
          icon: 'shield-checkmark-outline',
          onPress: () => navigation.navigate('VerificationStatus'),
        },
        {
          key: 'preferences',
          label: 'Preferences',
          icon: 'options-outline',
          onPress: () => navigation.navigate('Preferences'),
        },
        {
          key: 'tenancyHistory',
          label: 'Tenancy history',
          icon: 'time-outline',
          onPress: () => navigation.navigate('TenancyHistory'),
        },
      ]}
      roleLabel="Renter"
    />
  );
}
