import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert('Izin Ditolak', 'Aktifkan izin kamera/galeri di pengaturan perangkat untuk melanjutkan.');
    return null;
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}
