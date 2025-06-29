import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { CircleCheck as CheckCircle, Circle as XCircle, Stethoscope } from 'lucide-react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Check if we have the necessary parameters
      const { access_token, refresh_token, type } = params;

      if (type === 'signup' && access_token && refresh_token) {
        // Set the session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (error) {
          console.error('Error setting session:', error);
          setStatus('error');
          setMessage('Failed to verify email. Please try again.');
          return;
        }

        if (data.user) {
          // Create user profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: data.user.id,
              username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'new_user',
              full_name: data.user.user_metadata?.full_name || '',
              specialty: data.user.user_metadata?.specialty || '',
              years_experience: data.user.user_metadata?.years_experience || 0,
              bio: '',
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          setStatus('success');
          setMessage('Email verified successfully! Welcome to Nurse Prompt Hub.');
          
          // Redirect to home after a short delay
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage('Invalid verification link. Please try signing up again.');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <ActivityIndicator size="large" color="#14B8A6" />;
      case 'success':
        return <CheckCircle size={80} color="#10B981" />;
      case 'error':
        return <XCircle size={80} color="#EF4444" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#14B8A6';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Stethoscope size={40} color="#14B8A6" />
        </View>
        
        <Text style={styles.title}>Nurse Prompt Hub</Text>
        
        <View style={styles.statusContainer}>
          {getStatusIcon()}
        </View>

        <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </Text>

        <Text style={styles.message}>{message}</Text>

        {status === 'success' && (
          <Text style={styles.redirectText}>
            Redirecting you to the app...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});