import { useState, type ReactNode } from 'react';
import { Image, type ImageProps } from 'react-native';
import { resolveProfilePortrait, type PortraitProfile } from '../lib/profilePortrait';

// Presentation only: never writes a photoUrl or changes verification status.
export function ProfilePortrait({ profile, style, accessibilityLabel, fallback = null }: {
  profile?: PortraitProfile | null;
  style: ImageProps['style'];
  accessibilityLabel: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState<{ id: string; url: string } | null>(null);
  const portrait = resolveProfilePortrait(profile, failed?.id === profile?.id ? failed?.url : null);
  return portrait ? <Image source={portrait.source} style={style} resizeMode="cover"
    accessibilityLabel={portrait.demoOnly ? `${accessibilityLabel} (fictional demo portrait)` : accessibilityLabel}
    onError={() => { if (!portrait.demoOnly && profile?.photoUrl) setFailed({ id: profile.id, url: profile.photoUrl }); }} /> : fallback;
}
