import * as ImagePicker from 'expo-image-picker';

export async function pickImage(
  source: 'camera' | 'library',
  onPermissionDenied?: (message: string) => void,
): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    const msg = 'Aktifkan izin kamera/galeri di pengaturan perangkat untuk melanjutkan.';
    if (onPermissionDenied) {
      onPermissionDenied(msg);
    } else {
      console.warn('[pickImage] Izin Ditolak:', msg);
    }
    return null;
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}
