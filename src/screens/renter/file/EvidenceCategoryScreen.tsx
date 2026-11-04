import { ErrorState, LoadingState, ContentStateView } from '../../../components/QueryState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { FormInput } from '../../../components/FormInput';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { SelectionOption } from '../../../components/SelectionOption';
import { StatusBadge } from '../../../components/StatusBadge';
import { useEvidenceCatalogue, TRUST_PILLARS } from '../../../lib/trustPillars';
import type { RenterFileStackParamList } from '../../../navigation/renter/RenterFileStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/tokens';

type Props = NativeStackScreenProps<RenterFileStackParamList, 'EvidenceCategory'>;

export function EvidenceCategoryScreen({ navigation, route }: Props) {
  return <EvidenceDraft key={route.params.pillar} navigation={navigation} route={route} />;
}

function EvidenceDraft({ navigation, route }: Props) {
  const { pillar } = route.params;
  const catalogue = useEvidenceCatalogue();
  const options = catalogue.data?.filter((option) => option.pillar === pillar) ?? [];
  const meta = TRUST_PILLARS.find((p) => p.id === pillar);
  const [selected, setSelected] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: meta?.label ?? 'ARCS' });
  }, [navigation, meta]);

  function toggle(option: string) {
    setSelected((current) => current.includes(option)
      ? current.filter((value) => value !== option) : [...current, option]);
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <StatusBadge label="Explore evidence options" tone="highlight" />
        <Text style={styles.subtitle}>{pillar === 'community' ? 'Your community ties and support: universities, clubs, professional networks, volunteering and references.' : meta?.description}</Text>
        <Text style={styles.subtitle}>
          Choose the evidence that best reflects your circumstances. You don’t need every type of document.
        </Text>
        <Text style={styles.notice}>
          Saving evidence is not available yet. Your choices stay on this screen and clear when you leave.
        </Text>
        <FormInput label="Your explanation (optional)" multiline maxLength={2000}
          onChangeText={setExplanation} placeholder="Add context in your own words"
          textAlignVertical="top" value={explanation} />
        <Text style={styles.heading}>Evidence options</Text>
        {catalogue.isLoading ? <LoadingState /> : catalogue.error ? <ErrorState error={catalogue.error} onRetry={catalogue.reload} />
          : !options.length ? <ContentStateView state={{ kind: 'empty', message: 'No active evidence options for this strand.' }} />
          : options.map((option) => <SelectionOption key={option.id} label={option.label} selected={selected.includes(option.id)} onPress={() => toggle(option.id)} />)}
        {selected.length > 0 ? (
          <View style={styles.content}>
            <Text style={styles.heading}>Optional supporting files</Text>
            <Text style={styles.subtitle}>Use dummy documents only while trying the demo.</Text>
            {options.filter((option) => selected.includes(option.id)).map((option) => (
              <Button key={option.id} label={`Choose file: ${option.label}`} variant="secondary"
                onPress={() => navigation.navigate('EvidenceUpload', { pillar, pathwayType: option.label })} />
            ))}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23 },
  notice: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  heading: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: spacing.md },
});
