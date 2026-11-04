import type { ImageSourcePropType } from 'react-native';

// DEMO ONLY: exact synthetic account IDs from ile-api/demo/preview-allowlist.json.
// Metro removes this branch and its asset requires from production bundles.
// Names, roles and verification fields are deliberately not used for lookup.
const DEMO_PORTRAITS: Readonly<Record<string, ImageSourcePropType>> = __DEV__ ? {
  '33144328-594b-4c09-9eeb-2913c2c39b0f': require('../../assets/demo/portraits/amina.png'),
  'bbc84e2a-5e68-47d7-8ce2-69b218d3d550': require('../../assets/demo/portraits/david.png'),
  'b47ba3cc-7aa1-439a-9df6-b1e68fc92457': require('../../assets/demo/portraits/sarah.png'),
  '5271e678-d8ee-4f23-81b7-29e1dd9b0b3c': require('../../assets/demo/portraits/jamie.png'),
  '835b4e68-5ad7-4069-ad56-e15b6cf4a063': require('../../assets/demo/portraits/priya.png'),
  '56fa85f3-eb9b-4203-a763-2a7863569f36': require('../../assets/demo/portraits/lewis.png'),
} : {};

export type PortraitProfile = { id: string; photoUrl: string | null };

function validRemotePortrait(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}

export function resolveProfilePortrait(profile?: PortraitProfile | null, failedUrl?: string | null): {
  source: ImageSourcePropType; demoOnly: boolean;
} | null {
  if (!profile) return null;
  const demo = __DEV__ && Object.prototype.hasOwnProperty.call(DEMO_PORTRAITS, profile.id);
  const url = profile.photoUrl;
  // Preserve the ordinary remote source for everyone else, including production.
  if (url && url !== failedUrl && (!demo || validRemotePortrait(url))) {
    return { source: { uri: url }, demoOnly: false };
  }
  return demo ? { source: DEMO_PORTRAITS[profile.id], demoOnly: true } : null;
}
