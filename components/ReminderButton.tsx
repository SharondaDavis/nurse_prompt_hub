import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { ReminderSetup } from './ReminderSetup';

interface ReminderButtonProps {
  promptTitle?: string;
  promptCategory?: string;
  style?: any;
}

export function ReminderButton({ promptTitle, promptCategory, style }: ReminderButtonProps) {
  const [showReminderSetup, setShowReminderSetup] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.reminderButton, style]}
        onPress={() => setShowReminderSetup(true)}
        activeOpacity={0.7}
      >
        <Bell size={16} color="#14B8A6" />
        <Text style={styles.reminderButtonText}>Set Reminder</Text>
      </TouchableOpacity>

      <Modal
        visible={showReminderSetup}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <ReminderSetup
            onClose={() => setShowReminderSetup(false)}
            promptTitle={promptTitle}
            promptCategory={promptCategory}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#14B8A6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  reminderButtonText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
});