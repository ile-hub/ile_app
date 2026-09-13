import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLayoutEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../../components/ScreenContainer';
import type { RenterFileStackParamList } from '../../../navigation/renter/RenterFileStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterFileStackParamList, 'EvidenceUpload'>;

type PickedFile = { uri: string; name: string; kind: 'photo' | 'document' };

// Actually picks a real photo or document off the device (expo-image-picker
// / expo-document-picker), unlike the rest of this pillar's screens.
// Submitting is still a dead end — there's no evidence-upload endpoint to
// send it to yet — so the picked file just sits in local state with an
// honest "not connected yet" submit button, rather than pretending it saved.
export function EvidenceUploadScreen({ navigation, route }: Props) {
  const { pathwayType } = route.params;
  const [picked, setPicked] = useState<PickedFile | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: pathwayType });
  }, [navigation, pathwayType]);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in Settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    const asset = result.assets?.[0];
    if (asset) {
      setPicked({ uri: asset.uri, name: asset.fileName ?? 'Photo', kind: 'photo' });
    }
  }

  async function chooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Enable photo library access in Settings to choose one.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    const asset = result.assets?.[0];
    if (asset) {
      setPicked({ uri: asset.uri, name: asset.fileName ?? 'Photo', kind: 'photo' });
    }
  }

  async function chooseDocument() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    const asset = result.assets?.[0];
    if (asset) {
      setPicked({ uri: asset.uri, name: asset.name, kind: 'document' });
    }
  }

  return (
    <ScreenContainer>
      <Text style={styles.subtitle}>Take a photo, or choose a photo or document from your device.</Text>

      <View style={styles.actions}>
        <Pressable onPress={takePhoto} style={styles.actionButton}>
          <Ionicons color={colors.accent} name="camera-outline" size={20} />
          <Text style={styles.actionLabel}>Take Photo</Text>
        </Pressable>
        <Pressable onPress={chooseFromLibrary} style={styles.actionButton}>
          <Ionicons color={colors.accent} name="images-outline" size={20} />
          <Text style={styles.actionLabel}>Photo Library</Text>
        </Pressable>
        <Pressable onPress={chooseDocument} style={styles.actionButton}>
          <Ionicons color={colors.accent} name="document-outline" size={20} />
          <Text style={styles.actionLabel}>Document</Text>
        </Pressable>
      </View>

      {picked ? (
        <View style={styles.previewRow}>
          {picked.kind === 'photo' ? (
            <Image source={{ uri: picked.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewIcon}>
              <Ionicons color={colors.accent} name="document-text-outline" size={22} />
            </View>
          )}
          <Text numberOfLines={1} style={styles.previewName}>
            {picked.name}
          </Text>
          <Pressable hitSlop={8} onPress={() => setPicked(null)}>
            <Ionicons color={colors.textMuted} name="close-circle" size={20} />
          </Pressable>
        </View>
      ) : null}

      <Pressable disabled={!picked} style={[styles.submitButton, !picked && styles.submitButtonDisabled]}>
        <Text style={styles.submitButtonText}>Submit evidence</Text>
      </Pressable>
      <Text style={styles.footnote}>
        Submitting evidence isn't connected to your account yet — this file stays on your device
        for now.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    paddingVertical: 16,
  },
  actionLabel: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  previewRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    padding: 12,
  },
  previewImage: { borderRadius: 10, height: 44, width: 44 },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  previewName: { color: colors.textPrimary, flex: 1, fontSize: 14, fontWeight: '600' },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 28,
    minHeight: 56,
  },
  submitButtonDisabled: { backgroundColor: colors.accentMuted },
  submitButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  footnote: { color: colors.textMuted, fontSize: 12, marginTop: 10, textAlign: 'center' },
});
