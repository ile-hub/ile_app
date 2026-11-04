import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { api, ApiError } from '../../lib/api';
import { useApiQuery } from '../../lib/useApiQuery';
import type { ConnectionsStackParamList } from '../../navigation/ConnectionsStack';

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'Connected'>;
export function ConnectedScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const query = useApiQuery(`accepted-connection/${user?.id}/${route.params.connectionId}`, () => api.getConnection(route.params.connectionId));
  if (query.isLoading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (query.error) return <ScreenContainer>{query.error instanceof ApiError && [403, 404].includes(query.error.status)
    ? <ContentStateView state={{ kind: 'unavailable', message: 'This connection is unavailable.' }} />
    : <ErrorState error={query.error} onRetry={query.reload} />}</ScreenContainer>;
  const data = query.data;
  if (!data || data.status !== 'accepted' || !data.conversationId || !user || ![data.senderId, data.recipientId].includes(user.id)) return <ScreenContainer><ContentStateView state={{ kind: 'unavailable', message: 'An accepted connection is required.' }} /></ScreenContainer>;
  return <ScreenContainer><View style={styles.content}>
    <StatusBadge label="Accepted connection" />
    <Card><View style={styles.content}>
      <Text accessibilityLabel="Handshake" style={{ fontSize: 32 }}>🤝</Text>
      <Text style={styles.title}>You’re Connected!</Text>
      <Text style={styles.body}>You have both agreed to connect. Your connection is ready for messaging.</Text>
      <Text style={styles.body}>A connection does not guarantee a viewing, property, approval, reservation or tenancy agreement.</Text>
    </View></Card>
    <Button label="Start conversation" onPress={() => navigation.navigate('Conversation', { connectionId: data.id })} />
    <Button label="Back to Connections" variant="secondary" onPress={() => navigation.popTo('Connections')} />
  </View></ScreenContainer>;
}
