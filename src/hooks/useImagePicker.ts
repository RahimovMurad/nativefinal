import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export function useImagePicker() {
  const [isPicking, setIsPicking] = useState(false);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    setIsPicking(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Qalereya icazəsi',
          'Foto seçmək üçün qalereyaya giriş icazəsi tələb olunur.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch {
      Alert.alert('Xəta', 'Şəkil seçilərkən xəta baş verdi.');
      return null;
    } finally {
      setIsPicking(false);
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    setIsPicking(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Kamera icazəsi',
          'Şəkil çəkmək üçün kamera icazəsi tələb olunur.'
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch {
      Alert.alert('Xəta', 'Kamera açılarkən xəta baş verdi.');
      return null;
    } finally {
      setIsPicking(false);
    }
  }, []);

  return {
    isPicking,
    pickFromGallery,
    takePhoto,
  };
}
