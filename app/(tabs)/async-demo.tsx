import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import SafeAsyncComponent from '@/components/SafeAsyncComponent';

export default function AsyncDemoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <SafeAsyncComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});