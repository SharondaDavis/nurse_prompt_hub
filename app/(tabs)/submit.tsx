import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { PromptForm } from '@/components/PromptForm';
import { Auth } from '@/components/Auth';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'expo-router';

export default function SubmitScreen() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return <View style={styles.container} />;
  }

  const handleSuccess = () => {
    router.push('/(tabs)');
  };

  const handleCancel = () => {
    router.push('/(tabs)');
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  if (!user) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} />
        <Modal
          visible={showAuth}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <Auth
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        </Modal>
      </>
    );
  }

  return (
    <PromptForm onSuccess={handleSuccess} onCancel={handleCancel} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});