import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { Stethoscope, X, Mail, CircleCheck as CheckCircle, Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react-native';

interface AuthProps {
  onAuthSuccess?: () => void;
  onCancel?: () => void;
}

export function Auth({ onAuthSuccess, onCancel }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  const handleSupabaseError = (error: any) => {
    if (error.message?.includes('captcha verification process failed')) {
      Alert.alert(
        'Authentication Configuration Issue',
        'Your Supabase project has reCAPTCHA enabled. To fix this:\n\n1. Go to your Supabase Dashboard\n2. Navigate to Authentication → Settings\n3. Disable reCAPTCHA protection\n\nAlternatively, you can use Demo Mode for now.',
        [
          { text: 'Use Demo Mode', onPress: handleDemoAccess },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (error.message?.includes('Email not confirmed')) {
      Alert.alert(
        'Email Not Verified', 
        'Please check your email and click the verification link before signing in.',
        [
          { text: 'Resend Email', onPress: () => resendConfirmation(email) },
          { text: 'OK', style: 'default' }
        ]
      );
    } else {
      Alert.alert('Authentication Failed', error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters long.");
      return false;
    }

    if (isSignUp) {
      if (!username || !fullName || !specialty) {
        Alert.alert("Missing Information", "Please fill in all required fields.");
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert("Password Mismatch", "Passwords do not match.");
        return false;
      }

      if (username.length < 3) {
        Alert.alert("Username Too Short", "Username must be at least 3 characters long.");
        return false;
      }
    }

    return true;
  };

  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return `${process.env.EXPO_PUBLIC_SITE_URL || 'http://localhost:8081'}/auth/callback`;
  };

  const handleSignIn = async () => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful sign in
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess?.();
      }, 1000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleSupabaseError(error);
      } else if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          Alert.alert(
            'Email Not Verified', 
            'Please check your email and click the verification link to complete your account setup.',
            [
              { text: 'Resend Email', onPress: () => resendConfirmation(email) },
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          onAuthSuccess?.();
        }
      }
    } catch (err: any) {
      handleSupabaseError(err);
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async () => {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful sign up
      if (!validateForm()) {
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setPendingEmail(email);
        setShowEmailSent(true);
      }, 1000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the current URL for redirect
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Sign up with email confirmation required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${currentUrl}/auth/callback`,
          data: {
            username,
            full_name: fullName,
            specialty,
            years_experience: parseInt(yearsExperience || '0'),
          }
        }
      });

      if (error) {
        handleSupabaseError(error);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Show email confirmation message
        setPendingEmail(email);
        setShowEmailSent(true);
      }
    } catch (err: any) {
      handleSupabaseError(err);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
  };

  const resendConfirmation = async (emailAddress: string) => {
    if (!isSupabaseConfigured) return;

    setIsLoading(true);
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailAddress,
        options: {
          emailRedirectTo: `${currentUrl}/auth/callback`
        }
      });

      if (error) {
        handleSupabaseError(error);
      } else {
        Alert.alert('Email Sent', 'A new confirmation email has been sent to your inbox.');
      }
    } catch (err: any) {
      handleSupabaseError(err);
    }
    setIsLoading(false);
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess?.();
    }, 500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Email confirmation success screen
  if (showEmailSent) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            {onCancel && (
              <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
            
            <View style={styles.logoContainer}>
              <CheckCircle size={80} color="#10B981" />
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>We've sent a verification link to</Text>
            <Text style={styles.emailText}>{pendingEmail}</Text>
          </View>

          <View style={styles.emailInstructions}>
            <View style={styles.instructionItem}>
              <Mail size={24} color="#10B981" />
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>Check your inbox</Text>
                <Text style={styles.instructionDescription}>
                  Look for an email from Nurse Prompt Hub with the subject "Confirm your email"
                </Text>
              </View>
            </View>

            <View style={styles.instructionItem}>
              <CheckCircle size={24} color="#10B981" />
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>Click the verification link</Text>
                <Text style={styles.instructionDescription}>
                  Click the "Confirm Email" button in the email to verify your account
                </Text>
              </View>
            </View>

            <View style={styles.instructionItem}>
              <Stethoscope size={24} color="#10B981" />
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>Start using the app</Text>
                <Text style={styles.instructionDescription}>
                  Once verified, you can sign in and start sharing nursing prompts
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.emailActions}>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => resendConfirmation(pendingEmail)}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.resendButtonText}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.resendButtonText}>Resend Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setShowEmailSent(false);
                setPendingEmail('');
                setIsSignUp(false);
              }}
            >
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emailNote}>
            <Text style={styles.noteText}>
              <Text style={styles.noteTextBold}>Didn't receive the email?</Text>
              {'\n'}Check your spam folder or try resending the verification email.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {onCancel && (
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
          
          <View style={styles.logoContainer}>
            <Stethoscope size={80} color="#14B8A6" />
          </View>
          <Text style={styles.title}>Nurse Prompt Hub</Text>
          <Text style={styles.subtitle}>Real Prompts for Real Nurses</Text>
          
          {!isSupabaseConfigured && (
            <View style={styles.demoNotice}>
              <Text style={styles.demoText}>
                🚀 Demo Mode - Supabase not configured
              </Text>
            </View>
          )}
        </View>

        {!isSupabaseConfigured ? (
          <View style={styles.demoSection}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleDemoAccess}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.buttonText}>Loading...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Enter Demo Mode</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.demoDescription}>
              Experience the full app with sample nursing prompts and features.
              Configure Supabase to enable real authentication and data persistence.
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            {isSignUp && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Username *"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Specialty (e.g., ICU, ER, Med-Surg) *"
                  value={specialty}
                  onChangeText={setSpecialty}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Years of Experience"
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password *"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password *"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {isSignUp && (
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsText}>
                  Password must be at least 6 characters long
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.buttonText}>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>

            {isSignUp && (
              <View style={styles.emailVerificationNote}>
                <Text style={styles.verificationText}>
                  📧 You'll receive an email to verify your account after signing up
                </Text>
              </View>
            )}

            {/* reCAPTCHA Notice */}
            <View style={styles.captchaNotice}>
              <Text style={styles.captchaText}>
                💡 If you encounter authentication issues, try using Demo Mode or check your Supabase reCAPTCHA settings
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Stethoscope size={24} color="#14B8A6" />
          <Text style={styles.footerText}>
            Join thousands of nurses sharing knowledge
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
  },
  demoNotice: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  demoText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoSection: {
    marginBottom: 32,
  },
  demoDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  form: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  passwordRequirements: {
    marginBottom: 16,
  },
  requirementsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  emailVerificationNote: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  verificationText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
  captchaNotice: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  captchaText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#14B8A6',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  switchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minHeight: 44,
  },
  switchText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Email confirmation styles
  emailInstructions: {
    marginBottom: 32,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  instructionText: {
    flex: 1,
    marginLeft: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emailActions: {
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  emailNote: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  noteTextBold: {
    fontWeight: '600',
    color: '#374151',
  },
});