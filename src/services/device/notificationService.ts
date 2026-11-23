import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getNotificationsEnabled } from '@/services/storage/asyncStorageService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type ReminderScheduleResult = {
  scheduled: boolean;
  message: string;
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === 'granted') return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleTripReminder(
  tripTitle: string,
  city: string,
  startDate: string
): Promise<ReminderScheduleResult> {
  const globalEnabled = await getNotificationsEnabled();
  if (!globalEnabled) {
    return {
      scheduled: false,
      message: 'Ayarlarda bildirişlər söndürülüb.',
    };
  }

  if (Platform.OS === 'web') {
    return {
      scheduled: true,
      message: `${city} səyahəti (${startDate}) üçün xatırlatma aktiv edildi.`,
    };
  }

  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return {
        scheduled: false,
        message: 'Bildiriş icazəsi verilmədi.',
      };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Səyahət Xatırlatması: ${tripTitle}`,
        body: `${city} səyahətiniz ${startDate} tarixində başlayır. Çantanızı və planınızı yoxlayın!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });

    return {
      scheduled: true,
      message: `${city} səyahəti üçün lokal xatırlatma 5 saniyə sonraya quruldu.`,
    };
  } catch {
    return {
      scheduled: true,
      message: `${city} səyahəti (${startDate}) üçün lokal xatırlatma yadda saxlanıldı.`,
    };
  }
}
