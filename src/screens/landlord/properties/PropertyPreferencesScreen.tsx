import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ArcsPreferences } from '../../../components/ArcsPreferences';
import { Button } from '../../../components/Button';
import { FormInput } from '../../../components/FormInput';
import { ScreenContainer, screenStyles as styles } from '../../../components/ScreenContainer';
import { StatusBadge } from '../../../components/StatusBadge';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertyPreferences'>;
export function PropertyPreferencesScreen({ route }: Props) {
  return <PropertyPreferencesDraft key={route.params.propertyId} />;
}
function PropertyPreferencesDraft() {
  const [custom, setCustom] = useState(false);
  const [occupants, setOccupants] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  return <ScreenContainer><View style={styles.content}>
    <StatusBadge label="Explore property preferences" tone="highlight" />
    <Text style={styles.heading}>Factual tenancy requirements</Text>
    <Text style={styles.note}>Save practical property details in Edit details. Choices on this screen are not saved or applied.</Text>
    <FormInput label="Permitted occupants" keyboardType="number-pad" value={occupants} onChangeText={setOccupants} />
    <FormInput label="Available move date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
    <FormInput label="Minimum / expected tenancy duration" value={duration} onChangeText={setDuration} />
    <Text style={styles.heading}>ARCS preferences</Text>
    <Button label="Use my default preferences" variant={!custom ? 'primary' : 'secondary'}
      accessibilityState={{ selected: !custom }} onPress={() => setCustom(false)} />
    <Button label="Customise for this property" variant={custom ? 'primary' : 'secondary'}
      accessibilityState={{ selected: custom }} onPress={() => setCustom(true)} />
    {custom ? <ArcsPreferences scope="property" /> : <Text style={styles.body}>Using saved defaults is not available here yet. This choice is not saved or applied.</Text>}
    <Button disabled label="Save property preferences unavailable" />
  </View></ScreenContainer>;
}
