import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { CircleCheck as CheckCircle, Circle as XCircle, Stethoscope, ArrowRight } from 'lucide-react-native';

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
      const { access_token, refresh_token, type, error, error_description } = params;

      // Handle error cases first
      if (error) {
        console.error('Auth callback error:', error, error_description);
        setStatus('error');
        setMessage(error_description as string || 'Authentication failed. Please try again.');
        return;
      }

      if (type === 'signup' && access_token && refresh_token) {
        // Set the session with the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          setStatus('error');
          setMessage('Failed to verify email. Please try signing in again.');
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
              specialty: data.user.user_metadata?.specialty || 'General Practice',
              years_experience: data.user.user_metadata?.years_experience || 0,
              bio: '',
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't fail the whole process for profile creation errors
          }

          setStatus('success');
          setMessage('Your email has been successfully verified! Welcome to Nurse Prompt Hub.');
          
          // Redirect to home after a short delay
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 3000);
        }
      } else if (type === 'recovery') {
        // Handle password recovery
        setStatus('success');
        setMessage('Password recovery link verified. You can now reset your password.');
        
        setTimeout(() => {
          router.replace('/reset-password');
        }, 2000);
      } else {
        // Invalid or missing parameters
        setStatus('error');
        setMessage('Invalid verification link. Please try signing up again.');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    router.replace('/login');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <ActivityIndicator size="large" color="#6366F1" />;
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
        return '#6366F1';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return '#F0FDF4';
      case 'error':
        return '#FEF2F2';
      default:
        return '#F8FAFC';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Stethoscope size={40} color="#6366F1" />
          </View>
          <Text style={styles.logoText}>Nurse Prompt Hub</Text>
        </View>
        
        {/* Status Icon */}
        <View style={styles.statusContainer}>
          {getStatusIcon()}
        </View>

        {/* Status Title */}
        <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
          {status === 'loading' && 'Verifying Your Email...'}
          {status === 'success' && 'Email Verified Successfully!'}
          {status === 'error' && 'Verification Failed'}
        </Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Success Content */}
        {status === 'success' && (
          <View style={styles.successContent}>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>🎉 Welcome to the Community!</Text>
              <Text style={styles.welcomeText}>
                You're now part of a growing community of nursing professionals sharing knowledge and expertise.
              </Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>Access hundreds of nursing prompts</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>Save your favorite prompts</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>Share your own expertise</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>Connect with fellow nurses</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>Continue to App</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.autoRedirectText}>
              You'll be automatically redirected in a few seconds...
            </Text>
          </View>
        )}

        {/* Error Content */}
        {status === 'error' && (
          <View style={styles.errorContent}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>What can you do?</Text>
              <Text style={styles.errorText}>
                • Check if the verification link has expired{'\n'}
                • Try signing up again with a valid email{'\n'}
                • Make sure you clicked the correct link from your email{'\n'}
                • Check your spam folder for the verification email
              </Text>
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.9}
            >
              <Text style={styles.retryButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Content */}
        {status === 'loading' && (
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>
              Please wait while we verify your email address...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successContent: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
    marginRight: 12,
    width: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  autoRedirectText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContent: {
    width: '100%',
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});