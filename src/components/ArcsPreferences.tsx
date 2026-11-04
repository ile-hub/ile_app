import { ErrorState, LoadingState } from './QueryState';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useEvidenceCatalogue, TRUST_PILLARS, type TrustPillar } from '../lib/trustPillars';
import { Button } from './Button';
import { Card } from './Card';
import { screenStyles as styles } from './ScreenContainer';
import { StatusBadge } from './StatusBadge';

type EvidencePreference = 'Accept' | 'Prefer' | 'Not needed';
// One editor reused for landlord defaults and property overrides; nothing is persisted yet.
export function ArcsPreferences({ scope }: { scope: 'default' | 'property' }) {
  const catalogue = useEvidenceCatalogue();
  const [choices, setChoices] = useState<Record<string, EvidencePreference>>({});
  const [expanded, setExpanded] = useState<TrustPillar | null>(null);
  return <View style={styles.content}>
    <Text style={styles.heading}>{scope === 'default' ? 'Default evidence preferences' : 'Property evidence preferences'}</Text>
    <StatusBadge label="Explore evidence preferences" tone="highlight" />
    <Text style={styles.body}>Accept means evidence you welcome; Prefer means evidence you would find helpful; Not needed means you do not need it. Missing preferred evidence does not automatically exclude renters. ARCS does not rank or filter people.</Text>
    {catalogue.isLoading ? <LoadingState /> : catalogue.error ? <ErrorState error={catalogue.error} onRetry={catalogue.reload} /> : null}
    {TRUST_PILLARS.map((pillar) => {
      const id = pillar.id;
      return <Card key={id} title={pillar.label}><View style={styles.content}>
        <Button label={expanded === id ? 'Hide evidence options' : 'Choose evidence preferences'} variant="secondary" onPress={() => setExpanded(expanded === id ? null : id)} />
        {expanded === id ? (catalogue.error ? [] : catalogue.data ?? []).filter((option) => option.pillar === id).map((option) => {
          const key = option.id;
          return <View key={key} style={styles.content}>
            <Text style={styles.body}>{option.label}</Text>
            <View style={styles.row}>{(['Accept', 'Prefer', 'Not needed'] as const).map((value) => <Button key={value} label={value}
              accessibilityLabel={`${option.label}: ${value}`} accessibilityState={{ selected: choices[key] === value }}
              variant={choices[key] === value ? 'primary' : 'secondary'} onPress={() => setChoices((current) => ({ ...current, [key]: value }))} />)}</View>
          </View>;
        }) : null}
      </View></Card>;
    })}
    <Text style={styles.note}>Saving preferences is not available yet. These choices are not applied and clear when you leave.</Text>
    <Button disabled label="Save ARCS preferences unavailable" />
  </View>;
}
