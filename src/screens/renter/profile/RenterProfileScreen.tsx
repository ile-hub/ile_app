import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProfileEditor } from '../../../components/ProfileEditor';
import { AccountProfileScreen } from '../../../components/AccountProfileScreen';
import type { RenterProfileStackParamList } from '../../../navigation/renter/RenterProfileStack';

type Props = NativeStackScreenProps<RenterProfileStackParamList, 'RenterProfileMain'>;

export function RenterProfileScreen({ navigation }: Props) {
  const [section, setSection] = useState('overview');
  return (
    <AccountProfileScreen focused flow={section}
      menuItems={[
        {
          key: 'verification',
          label: 'Verification status',
          icon: 'shield-checkmark-outline',
          onPress: () => navigation.navigate('VerificationStatus'),
        },
        {
          key: 'evidence',
          label: 'My ARCS evidence',
          icon: 'folder-outline',
          onPress: () => navigation.navigate('Evidence'),
        },
      ]}
      roleLabel="Renter"
    ><ProfileEditor role="renter" onSectionChange={setSection} /></AccountProfileScreen>
  );
}
