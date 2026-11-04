import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Property, PropertyStatus } from '@yourorg/ile-shared-types';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import { ErrorState, LoadingState } from '../../../components/QueryState';
import { api } from '../../../lib/api';
import { propertyName, propertySummaryLine } from '../../../lib/properties';
import { useApiQuery } from '../../../lib/useApiQuery';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertiesList'>;

const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

// All of the landlord's properties, any status (GET /properties/me).
// Refetches on focus, so it's current after adding or editing one.
export function PropertiesListScreen({ navigation }: Props) {
  const { data, error, isLoading, isRefreshing, refresh, reload } = useApiQuery(
    'properties/me',
    api.listMyProperties,
  );

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
    <ListScreenContainer<Property>
      ListEmptyComponent={
        isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : (
          <EmptyState
            actionLabel="Add a property"
            icon="business-outline"
            onAction={() => navigation.navigate('AddEditProperty', {})}
            subtitle="Add a property so we can help you discover compatible renters."
            title="No properties yet"
          />
        )
      }
      data={data ?? []}
      keyExtractor={(item) => item.id}
      onRefresh={refresh}
      refreshing={isRefreshing}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text numberOfLines={1} style={styles.title}>
                {propertyName(item)}
              </Text>
              {item.status !== 'draft' ? <View style={[styles.badge, item.status === 'published' && styles.badgeLive]}>
                <Text
                  style={[styles.badgeText, item.status === 'published' && styles.badgeTextLive]}
                >
                  {STATUS_LABELS[item.status]}
                </Text>
              </View> : null}
            </View>
            <Text style={styles.subtitle}>{propertySummaryLine(item)}</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  card: { marginBottom: 12 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  title: { color: colors.textPrimary, flex: 1, fontSize: 16, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  badge: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeLive: { backgroundColor: colors.accentMuted, borderColor: colors.accentMuted },
  badgeText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  badgeTextLive: { color: colors.accentPressed },
});
