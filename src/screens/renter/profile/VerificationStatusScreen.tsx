import { Text, View } from 'react-native';
import { useProfile } from '../../../auth/ProfileProvider';
import { Button } from '../../../components/Button';
import { ErrorState, LoadingState } from '../../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../../components/ScreenContainer';
import { ProfileVerification } from '../../../components/StatusBadge';

// Shared status content reused by the landlord screen; only the server assigns results.
export function VerificationStatusContent() {
  const { profile, isLoading, error, reload } = useProfile();
  return <View style={styles.content}>
    {isLoading ? <LoadingState /> : null}
    {error ? <ErrorState error={error} onRetry={reload} /> : null}
    {profile ? <ProfileVerification verification={profile.verification} /> : null}
    <Text style={styles.body}>Your verification results are shown here. Adding a profile photo does not verify your identity.</Text>
    <Text style={styles.note}>Starting a verification check is not available yet.</Text>
    <Button label="Refresh status" variant="secondary" disabled={isLoading} onPress={() => void reload()} />
    <Button disabled label="Start verification unavailable" />
  </View>;
}
export function VerificationStatusScreen() {
  return <ScreenContainer><VerificationStatusContent /></ScreenContainer>;
}
