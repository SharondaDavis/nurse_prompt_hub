import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  Droplets, 
  Coffee, 
  Pill, 
  Clock, 
  Plus, 
  X,
  Settings,
  Smartphone,
  Watch
} from 'lucide-react-native';

interface ReminderSetupProps {
  onClose: () => void;
  promptTitle?: string;
  promptCategory?: string;
}

export function ReminderSetup({ onClose, promptTitle, promptCategory }: ReminderSetupProps) {
  const {
    permissionStatus,
    scheduleHydrationReminder,
    scheduleBreakReminder,
    scheduleMedicationReminder,
    scheduleCustomReminder,
    scheduledReminders,
    cancelScheduledReminder,
  } = useNotifications();

  const [customTitle, setCustomTitle] = useState(promptTitle || '');
  const [customBody, setCustomBody] = useState('');
  const [customDelay, setCustomDelay] = useState('30');
  const [medicationName, setMedicationName] = useState('');
  const [medicationDelay, setMedicationDelay] = useState('60');
  const [hydrationEnabled, setHydrationEnabled] = useState(false);
  const [breakEnabled, setBreakEnabled] = useState(false);

  const handleSetupHydrationReminder = async () => {
    try {
      const notificationId = await scheduleHydrationReminder(240); // 4 hours
      if (notificationId) {
        Alert.alert(
          'Reminder Set!',
          'You\'ll receive hydration reminders every 4 hours during your shift.',
          [{ text: 'OK' }]
        );
        setHydrationEnabled(true);
      } else {
        Alert.alert('Error', 'Failed to set up hydration reminder. Please check your notification permissions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set up hydration reminder.');
    }
  };

  const handleSetupBreakReminder = async () => {
    try {
      const notificationId = await scheduleBreakReminder(120); // 2 hours
      if (notificationId) {
        Alert.alert(
          'Reminder Set!',
          'You\'ll receive break reminders every 2 hours during your shift.',
          [{ text: 'OK' }]
        );
        setBreakEnabled(true);
      } else {
        Alert.alert('Error', 'Failed to set up break reminder. Please check your notification permissions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set up break reminder.');
    }
  };

  const handleSetupMedicationReminder = async () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter a medication name.');
      return;
    }

    const delay = parseInt(medicationDelay);
    if (isNaN(delay) || delay <= 0) {
      Alert.alert('Error', 'Please enter a valid time in minutes.');
      return;
    }

    try {
      const notificationId = await scheduleMedicationReminder(medicationName, delay);
      if (notificationId) {
        Alert.alert(
          'Reminder Set!',
          `You'll receive a reminder to administer ${medicationName} in ${delay} minutes.`,
          [{ text: 'OK' }]
        );
        setMedicationName('');
        setMedicationDelay('60');
      } else {
        Alert.alert('Error', 'Failed to set up medication reminder. Please check your notification permissions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set up medication reminder.');
    }
  };

  const handleSetupCustomReminder = async () => {
    if (!customTitle.trim() || !customBody.trim()) {
      Alert.alert('Error', 'Please enter both title and message.');
      return;
    }

    const delay = parseInt(customDelay);
    if (isNaN(delay) || delay <= 0) {
      Alert.alert('Error', 'Please enter a valid time in minutes.');
      return;
    }

    try {
      const notificationId = await scheduleCustomReminder(customTitle, customBody, delay, promptCategory || 'custom');
      if (notificationId) {
        Alert.alert(
          'Reminder Set!',
          `You'll receive your custom reminder in ${delay} minutes.`,
          [{ text: 'OK' }]
        );
        setCustomTitle('');
        setCustomBody('');
        setCustomDelay('30');
      } else {
        Alert.alert('Error', 'Failed to set up custom reminder. Please check your notification permissions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set up custom reminder.');
    }
  };

  const handleCancelReminder = async (reminderId: string) => {
    const success = await cancelScheduledReminder(reminderId);
    if (success) {
      Alert.alert('Reminder Cancelled', 'The reminder has been cancelled successfully.');
    } else {
      Alert.alert('Error', 'Failed to cancel the reminder.');
    }
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Setup</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Bell size={48} color="#EF4444" />
          </View>
          <Text style={styles.permissionTitle}>Notifications Disabled</Text>
          <Text style={styles.permissionText}>
            To receive reminders on your phone or Apple Watch, please enable notifications in your device settings.
          </Text>
          
          <View style={styles.deviceIcons}>
            <View style={styles.deviceIcon}>
              <Smartphone size={32} color="#14B8A6" />
              <Text style={styles.deviceText}>Phone</Text>
            </View>
            <View style={styles.deviceIcon}>
              <Watch size={32} color="#14B8A6" />
              <Text style={styles.deviceText}>Apple Watch</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingsButton} onPress={onClose}>
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.settingsButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Set Up Reminders</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Get notifications on your phone or Apple Watch to help you stay on track during your shift.
        </Text>

        {/* Quick Setup Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Setup</Text>
          
          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Droplets size={24} color="#14B8A6" />
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>Hydration Reminder</Text>
                <Text style={styles.reminderDescription}>Every 4 hours during your shift</Text>
              </View>
              <Switch
                value={hydrationEnabled}
                onValueChange={setHydrationEnabled}
                trackColor={{ false: '#E5E5E5', true: '#14B8A6' }}
                thumbColor={hydrationEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            {!hydrationEnabled && (
              <TouchableOpacity style={styles.setupButton} onPress={handleSetupHydrationReminder}>
                <Plus size={16} color="#14B8A6" />
                <Text style={styles.setupButtonText}>Set Up Hydration Reminders</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Coffee size={24} color="#F59E0B" />
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>Break Reminder</Text>
                <Text style={styles.reminderDescription}>Every 2 hours during your shift</Text>
              </View>
              <Switch
                value={breakEnabled}
                onValueChange={setBreakEnabled}
                trackColor={{ false: '#E5E5E5', true: '#F59E0B' }}
                thumbColor={breakEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            {!breakEnabled && (
              <TouchableOpacity style={[styles.setupButton, styles.breakButton]} onPress={handleSetupBreakReminder}>
                <Plus size={16} color="#F59E0B" />
                <Text style={[styles.setupButtonText, styles.breakButtonText]}>Set Up Break Reminders</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Medication Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication Reminder</Text>
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Pill size={20} color="#7D3C98" />
              <Text style={styles.inputTitle}>Set Medication Reminder</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Medication name (e.g., Metoprolol)"
              value={medicationName}
              onChangeText={setMedicationName}
              placeholderTextColor="#999999"
            />
            
            <View style={styles.timeInputContainer}>
              <Clock size={16} color="#666666" />
              <TextInput
                style={styles.timeInput}
                placeholder="60"
                value={medicationDelay}
                onChangeText={setMedicationDelay}
                keyboardType="numeric"
                placeholderTextColor="#999999"
              />
              <Text style={styles.timeLabel}>minutes</Text>
            </View>
            
            <TouchableOpacity style={styles.medicationButton} onPress={handleSetupMedicationReminder}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.medicationButtonText}>Schedule Medication Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Reminder</Text>
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Bell size={20} color="#3B82F6" />
              <Text style={styles.inputTitle}>Create Custom Reminder</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Reminder title"
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholderTextColor="#999999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Reminder message"
              value={customBody}
              onChangeText={setCustomBody}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999999"
            />
            
            <View style={styles.timeInputContainer}>
              <Clock size={16} color="#666666" />
              <TextInput
                style={styles.timeInput}
                placeholder="30"
                value={customDelay}
                onChangeText={setCustomDelay}
                keyboardType="numeric"
                placeholderTextColor="#999999"
              />
              <Text style={styles.timeLabel}>minutes</Text>
            </View>
            
            <TouchableOpacity style={styles.customButton} onPress={handleSetupCustomReminder}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.customButtonText}>Schedule Custom Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Reminders */}
        {scheduledReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Reminders</Text>
            {scheduledReminders.filter(r => r.isActive).map((reminder) => (
              <View key={reminder.id} style={styles.activeReminderCard}>
                <View style={styles.activeReminderInfo}>
                  <Text style={styles.activeReminderTitle}>{reminder.promptTitle}</Text>
                  <Text style={styles.activeReminderTime}>
                    Scheduled for {new Date(reminder.scheduledFor).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.activeReminderType}>{reminder.reminderType}</Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelReminder(reminder.id)}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666666',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  setupButtonText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  breakButton: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  breakButtonText: {
    color: '#F59E0B',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  timeInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333333',
    width: 80,
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#666666',
  },
  medicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D3C98',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  medicationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  customButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeReminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeReminderInfo: {
    flex: 1,
  },
  activeReminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  activeReminderTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  activeReminderType: {
    fontSize: 12,
    color: '#999999',
    textTransform: 'capitalize',
  },
  cancelButton: {
    padding: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  deviceIcons: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  deviceIcon: {
    alignItems: 'center',
  },
  deviceText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});