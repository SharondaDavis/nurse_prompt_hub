import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ShadowExample from '@/components/ShadowExample';

export default function ShadowDemoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ShadowExample />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});