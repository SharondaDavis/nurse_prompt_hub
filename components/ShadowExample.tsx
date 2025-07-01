import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { createShadow, shadowStyles } from '../utils/shadowStyles';

export default function ShadowExample() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cross-Platform Shadow Examples</Text>
      
      {/* Predefined shadows */}
      <Text style={styles.sectionTitle}>Predefined Shadows</Text>
      
      <View style={[styles.box, shadowStyles.small]}>
        <Text style={styles.boxText}>Small Shadow</Text>
      </View>
      
      <View style={[styles.box, shadowStyles.medium]}>
        <Text style={styles.boxText}>Medium Shadow</Text>
      </View>
      
      <View style={[styles.box, shadowStyles.large]}>
        <Text style={styles.boxText}>Large Shadow</Text>
      </View>
      
      <View style={[styles.box, shadowStyles.button]}>
        <Text style={styles.boxText}>Button Shadow</Text>
      </View>
      
      <View style={[styles.box, shadowStyles.card]}>
        <Text style={styles.boxText}>Card Shadow</Text>
      </View>
      
      <View style={[styles.box, shadowStyles.modal]}>
        <Text style={styles.boxText}>Modal Shadow</Text>
      </View>
      
      {/* Custom shadows */}
      <Text style={styles.sectionTitle}>Custom Shadows</Text>
      
      <View style={[styles.box, createShadow({ 
        color: '#FF5722', 
        opacity: 0.3,
        radius: 10,
        offset: { width: 0, height: 5 },
        elevation: 10
      })]}>
        <Text style={styles.boxText}>Custom Orange Shadow</Text>
      </View>
      
      <View style={[styles.box, createShadow({ 
        color: '#4CAF50', 
        opacity: 0.4,
        radius: 6,
        offset: { width: 4, height: 4 },
        elevation: 8
      })]}>
        <Text style={styles.boxText}>Custom Green Shadow with Offset</Text>
      </View>
      
      <View style={[styles.box, createShadow({ 
        color: '#2196F3', 
        opacity: 0.2,
        radius: 20,
        offset: { width: 0, height: 10 },
        elevation: 15
      })]}>
        <Text style={styles.boxText}>Custom Blue Shadow (Large Blur)</Text>
      </View>
      
      <Text style={styles.platformInfo}>
        Current Platform: {Platform.OS}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  box: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  platformInfo: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});