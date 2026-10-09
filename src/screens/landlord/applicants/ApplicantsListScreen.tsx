import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import type { LandlordApplicantsStackParamList } from '../../../navigation/landlord/LandlordApplicantsStack';
import { useLandlordApplicants, type Applicant } from '../../../state/LandlordApplicantsProvider';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordApplicantsStackParamList, 'ApplicantsList'>;

// Across all properties, filterable by property. Deliberately shows only
// name, property, and compatibility here — trust profile detail lives on
// ApplicantDetailScreen. Sorted oldest-applied-first among still-pending
// applicants, so nobody waits longer than necessary. There are exactly two
// actions — "Interested" (matches) and "Not a fit" (declines) — no
// "shortlist" or third state; either one removes the applicant from this
// active/pending queue immediately (matched ones move to the Matched tab,
// declined ones just quietly disappear — see LandlordApplicantsProvider).
// Uses ListScreenContainer (FlatList) since this is an open-ended list once
// real data exists — the filter chips ride along as ListHeaderComponent so
// they scroll with the list rather than sitting in a separate ScrollView.
export function ApplicantsListScreen({ navigation }: Props) {
  const { applicants, decline, expressInterest } = useLandlordApplicants();
  const [propertyFilter, setPropertyFilter] = useState<'all' | string>('all');

  const properties = useMemo(() => {
    const seen = new Map<string, string>();
    for (const applicant of applicants) {
      seen.set(applicant.propertyId, applicant.propertyName);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [applicants]);

  const visibleApplicants = useMemo(
    () =>
      applicants
        .filter((a) => a.status === 'pending')
        .filter((a) => propertyFilter === 'all' || a.propertyId === propertyFilter)
        .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()),
    [applicants, propertyFilter],
  );

  return (
    <ListScreenContainer<Applicant>
      ListEmptyComponent={
        <EmptyState
          icon="people-outline"
          subtitle="Applicants to any of your properties will show up here, oldest application first, with their compatibility score."
          title="No applicants yet"
        />
      }
      ListHeaderComponent={
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setPropertyFilter('all')}
            style={[styles.chip, propertyFilter === 'all' && styles.chipSelected]}
          >
            <Text style={[styles.chipText, propertyFilter === 'all' && styles.chipTextSelected]}>
              All properties
            </Text>
          </Pressable>
          {properties.map((property) => (
            <Pressable
              key={property.id}
              onPress={() => setPropertyFilter(property.id)}
              style={[styles.chip, propertyFilter === property.id && styles.chipSelected]}
            >
              <Text
                style={[
                  styles.chipText,
                  propertyFilter === property.id && styles.chipTextSelected,
                ]}
              >
                {property.name}
              </Text>
            </Pressable>
          ))}
        </View>
      }
      data={visibleApplicants}
      keyExtractor={(applicant) => applicant.id}
      renderItem={({ item: applicant }) => (
        <Pressable
          onPress={() => navigation.navigate('ApplicantDetail', { applicantId: applicant.id })}
        >
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.name}>{applicant.name}</Text>
                <Text style={styles.property}>{applicant.propertyName}</Text>
              </View>
              <View style={styles.compatibility}>
                <Text style={styles.compatibilityValue}>{applicant.compatibilityPercent}%</Text>
                <Text style={styles.compatibilityLabel}>Compatible</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => decline(applicant.id)} style={styles.rejectButton}>
                <Text style={styles.rejectButtonText}>Not a fit</Text>
              </Pressable>
              <Pressable
                onPress={() => expressInterest(applicant.id)}
                style={styles.interestedButton}
              >
                <Text style={styles.interestedButtonText}>Interested</Text>
              </Pressable>
            </View>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipSelected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: colors.surface },
  card: { marginBottom: 14, marginTop: 20 },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  property: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  compatibility: { alignItems: 'flex-end' },
  compatibilityValue: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  compatibilityLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  rejectButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  rejectButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  interestedButton: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 22,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  interestedButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
});
