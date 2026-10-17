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
  const [order, setOrder] = useState<TrustPillar[]>(TRUST_PILLARS.map((pillar) => pillar.id));
  const [choices, setChoices] = useState<Record<string, EvidencePreference>>({});
  const [expanded, setExpanded] = useState<TrustPillar | null>(null);
  function move(index: number, delta: number) {
    setOrder((current) => {
      const next = [...current]; const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }
  return <View style={styles.content}>
    <Text style={styles.heading}>{scope === 'default' ? 'Default ARCS priorities' : 'Property ARCS priorities'}</Text>
    <StatusBadge label="Unsaved draft" tone="highlight" />
    <Text style={styles.body}>Rank 1 is most important; rank 4 is least important. These preferences help you understand evidence, and never exclude or lower someone in discovery.</Text>
    {catalogue.isLoading ? <LoadingState /> : catalogue.error ? <ErrorState error={catalogue.error} onRetry={catalogue.reload} /> : null}
    {order.map((id, index) => {
      const pillar = TRUST_PILLARS.find((item) => item.id === id)!;
      return <Card key={id}><View style={styles.content}>
        <Text style={styles.heading}>{index + 1}. {pillar.label}</Text>
        <View style={styles.row}>
          <Button label={`Move ${pillar.label} up`} variant="secondary" disabled={index === 0} onPress={() => move(index, -1)} />
          <Button label={`Move ${pillar.label} down`} variant="secondary" disabled={index === order.length - 1} onPress={() => move(index, 1)} />
        </View>
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
    <Text style={styles.note}>Options are loaded from the server. Priority order and evidence choices are not supported for saving in Phase 1, and are not saved or applied. They reset when you leave this editor.</Text>
    <Button disabled label="Save ARCS preferences unavailable" />
  </View>;
}
