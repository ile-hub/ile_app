import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import type { LandlordApplicantsStackParamList } from '../../../navigation/landlord/LandlordApplicantsStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordApplicantsStackParamList, 'ApplicantsList'>;

type ApplicantStatus = 'pending' | 'shortlisted' | 'rejected';

type Applicant = {
  id: string;
  name: string;
  propertyId: string;
  propertyName: string;
  compatibilityPercent: number;
  appliedAt: string; // ISO date
  status: ApplicantStatus;
};

// No applicants API exists yet, so this starts empty rather than showing
// sample rows. The list, filter, and sort logic below is real — it'll just
// have something to do once applicants actually come in.
const INITIAL_APPLICANTS: Applicant[] = [];

// Across all properties, filterable by property. Deliberately shows only
// name, property, and compatibility here — trust profile detail lives on
// ApplicantDetailScreen. Sorted oldest-applied-first among still-pending
// applicants, so nobody waits longer than necessary; once shortlisted or
// rejected, an applicant drops out of this queue. Uses ListScreenContainer
// (FlatList) since this is an open-ended list once real data exists — the
// filter chips ride along as ListHeaderComponent so they scroll with the
// list rather than sitting in a separate ScrollView.
export function ApplicantsListScreen({ navigation }: Props) {
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
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

  function decide(id: string, status: 'shortlisted' | 'rejected') {
    setApplicants((current) => current.map((a) => (a.id === id ? { ...a, status } : a)));
  }

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
              <Pressable
                onPress={() => decide(applicant.id, 'rejected')}
                style={styles.rejectButton}
              >
                <Text style={styles.rejectButtonText}>Not a fit</Text>
              </Pressable>
              <Pressable
                onPress={() => decide(applicant.id, 'shortlisted')}
                style={styles.shortlistButton}
              >
                <Text style={styles.shortlistButtonText}>Shortlist</Text>
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
  shortlistButton: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 22,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  shortlistButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
});
