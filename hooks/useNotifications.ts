import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  trigger: Notifications.NotificationTriggerInput;
  data?: any;
}

export interface ScheduledReminder {
  id: string;
  notificationId: string;
  promptTitle: string;
  reminderType: string;
  scheduledFor: Date;
  isActive: boolean;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (Platform.OS !== 'web') {
      registerForPushNotificationsAsync().then(token => {
        if (token && mountedRef.current) {
          setExpoPushToken(token);
        }
      });

      // Listen for notifications received while app is running
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        if (mountedRef.current) {
          setNotification(notification);
        }
      });

      // Listen for user interactions with notifications
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        const data = response.notification.request.content.data;
        if (data?.type === 'reminder') {
          // Handle reminder notification tap
          handleReminderNotificationTap(data);
        }
      });

      // Load scheduled reminders from storage
      loadScheduledReminders();
    }

    return () => {
      mountedRef.current = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token = null;

    if (Platform.OS === 'web') {
      console.log('Push notifications are not supported on web');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (mountedRef.current) {
      setPermissionStatus(finalStatus);
    }

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      if (mountedRef.current) {
        setPermissionStatus(finalStatus);
      }
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('nurse-reminders', {
        name: 'Nurse Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#14B8A6',
        sound: 'default',
      });
    }

    return token;
  };

  const scheduleNotification = async (reminder: ReminderNotification): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        console.log('Notifications not supported on web');
        return null;
      }

      if (permissionStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: reminder.trigger,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') return false;
      
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  };

  const scheduleHydrationReminder = async (intervalMinutes: number = 240): Promise<string | null> => {
    const reminder: ReminderNotification = {
      id: `hydration-${Date.now()}`,
      title: '💧 Hydration Reminder',
      body: 'Time for a water break! Stay hydrated during your shift.',
      trigger: {
        seconds: intervalMinutes * 60,
        repeats: true,
      },
      data: {
        type: 'reminder',
        category: 'hydration',
        promptTitle: 'Hydration & Bio-Break Check',
      },
    };

    const notificationId = await scheduleNotification(reminder);
    if (notificationId) {
      await saveScheduledReminder({
        id: reminder.id,
        notificationId,
        promptTitle: reminder.data.promptTitle,
        reminderType: 'hydration',
        scheduledFor: new Date(Date.now() + intervalMinutes * 60 * 1000),
        isActive: true,
      });
    }
    return notificationId;
  };

  const scheduleBreakReminder = async (intervalMinutes: number = 120): Promise<string | null> => {
    const reminder: ReminderNotification = {
      id: `break-${Date.now()}`,
      title: '🚶‍♀️ Break Reminder',
      body: 'Time for a quick break! Take care of yourself.',
      trigger: {
        seconds: intervalMinutes * 60,
        repeats: true,
      },
      data: {
        type: 'reminder',
        category: 'break',
        promptTitle: 'Self-Care Break',
      },
    };

    const notificationId = await scheduleNotification(reminder);
    if (notificationId) {
      await saveScheduledReminder({
        id: reminder.id,
        notificationId,
        promptTitle: reminder.data.promptTitle,
        reminderType: 'break',
        scheduledFor: new Date(Date.now() + intervalMinutes * 60 * 1000),
        isActive: true,
      });
    }
    return notificationId;
  };

  const scheduleMedicationReminder = async (medicationName: string, timeMinutes: number): Promise<string | null> => {
    const reminder: ReminderNotification = {
      id: `medication-${Date.now()}`,
      title: '💊 Medication Reminder',
      body: `Time to administer ${medicationName}`,
      trigger: {
        seconds: timeMinutes * 60,
      },
      data: {
        type: 'reminder',
        category: 'medication',
        medication: medicationName,
        promptTitle: 'Medication Administration',
      },
    };

    const notificationId = await scheduleNotification(reminder);
    if (notificationId) {
      await saveScheduledReminder({
        id: reminder.id,
        notificationId,
        promptTitle: reminder.data.promptTitle,
        reminderType: 'medication',
        scheduledFor: new Date(Date.now() + timeMinutes * 60 * 1000),
        isActive: true,
      });
    }
    return notificationId;
  };

  const scheduleCustomReminder = async (
    title: string,
    body: string,
    delayMinutes: number,
    category: string = 'custom'
  ): Promise<string | null> => {
    const reminder: ReminderNotification = {
      id: `custom-${Date.now()}`,
      title,
      body,
      trigger: {
        seconds: delayMinutes * 60,
      },
      data: {
        type: 'reminder',
        category,
        promptTitle: title,
      },
    };

    const notificationId = await scheduleNotification(reminder);
    if (notificationId) {
      await saveScheduledReminder({
        id: reminder.id,
        notificationId,
        promptTitle: title,
        reminderType: category,
        scheduledFor: new Date(Date.now() + delayMinutes * 60 * 1000),
        isActive: true,
      });
    }
    return notificationId;
  };

  const saveScheduledReminder = async (reminder: ScheduledReminder): Promise<void> => {
    try {
      if (Platform.OS === 'web') return;
      
      const existingReminders = await AsyncStorage.getItem('scheduledReminders');
      const reminders: ScheduledReminder[] = existingReminders ? JSON.parse(existingReminders) : [];
      reminders.push(reminder);
      await AsyncStorage.setItem('scheduledReminders', JSON.stringify(reminders));
      
      if (mountedRef.current) {
        setScheduledReminders(reminders);
      }
    } catch (error) {
      console.error('Error saving scheduled reminder:', error);
    }
  };

  const loadScheduledReminders = async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') return;
      
      const existingReminders = await AsyncStorage.getItem('scheduledReminders');
      if (existingReminders) {
        const reminders: ScheduledReminder[] = JSON.parse(existingReminders);
        // Filter out expired reminders
        const activeReminders = reminders.filter(reminder => 
          new Date(reminder.scheduledFor) > new Date() && reminder.isActive
        );
        
        if (mountedRef.current) {
          setScheduledReminders(activeReminders);
        }
        
        // Update storage with filtered reminders
        await AsyncStorage.setItem('scheduledReminders', JSON.stringify(activeReminders));
      }
    } catch (error) {
      console.error('Error loading scheduled reminders:', error);
    }
  };

  const cancelScheduledReminder = async (reminderId: string): Promise<boolean> => {
    try {
      const reminder = scheduledReminders.find(r => r.id === reminderId);
      if (reminder) {
        const success = await cancelNotification(reminder.notificationId);
        if (success) {
          const updatedReminders = scheduledReminders.map(r =>
            r.id === reminderId ? { ...r, isActive: false } : r
          );
          
          if (mountedRef.current) {
            setScheduledReminders(updatedReminders);
          }
          
          if (Platform.OS !== 'web') {
            await AsyncStorage.setItem('scheduledReminders', JSON.stringify(updatedReminders));
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error cancelling scheduled reminder:', error);
      return false;
    }
  };

  const handleReminderNotificationTap = (data: any): void => {
    console.log('Reminder notification tapped:', data);
    // You can implement navigation logic here
    // For example, navigate to a specific screen based on the reminder type
  };

  const clearAllReminders = async (): Promise<void> => {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.removeItem('scheduledReminders');
      }
      
      if (mountedRef.current) {
        setScheduledReminders([]);
      }
    } catch (error) {
      console.error('Error clearing all reminders:', error);
    }
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    scheduledReminders,
    scheduleNotification,
    cancelNotification,
    scheduleHydrationReminder,
    scheduleBreakReminder,
    scheduleMedicationReminder,
    scheduleCustomReminder,
    cancelScheduledReminder,
    clearAllReminders,
    loadScheduledReminders,
  };
}