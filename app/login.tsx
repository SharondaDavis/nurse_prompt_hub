import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, Eye, EyeOff, Stethoscope, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

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
      if (!fullName || !username || !specialty) {
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

  const handleSupabaseError = (error: any) => {
    console.error('Supabase error:', error);
    
    if (error.message?.includes('captcha verification process failed')) {
      Alert.alert(
        'reCAPTCHA Issue',
        'Your Supabase project has reCAPTCHA enabled which can cause issues. To fix this:\n\n1. Go to your Supabase Dashboard\n2. Navigate to Authentication → Settings\n3. Disable "Enable Captcha protection"\n\nFor now, you can use Demo Mode.',
        [
          { text: 'Use Demo Mode', onPress: handleDemoMode },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (error.message?.includes('Email not confirmed')) {
      Alert.alert(
        'Email Not Verified', 
        'Please check your email and click the verification link before signing in.',
        [
          { text: 'Resend Email', onPress: () => resendConfirmation() },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (error.message?.includes('Invalid login credentials')) {
      Alert.alert('Invalid Credentials', 'Please check your email and password and try again.');
    } else if (error.message?.includes('User already registered')) {
      Alert.alert('Account Exists', 'An account with this email already exists. Please sign in instead.');
      setIsSignUp(false);
    } else if (error.message?.includes('Signup is disabled')) {
      Alert.alert('Signup Disabled', 'New user registration is currently disabled. Please contact support.');
    } else {
      Alert.alert('Authentication Error', error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleDemoMode = () => {
    Alert.alert(
      'Demo Mode',
      'Demo mode activated! You can explore the app with sample data.',
      [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return `${process.env.EXPO_PUBLIC_SITE_URL || 'http://localhost:8081'}/auth/callback`;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        setTimeout(() => {
          setIsLoading(false);
          Alert.alert(
            'Demo Mode',
            'Supabase is not configured. You can explore the app in demo mode.',
            [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
          );
        }, 1000);
        return;
      }

      if (isSignUp) {
        console.log('Starting signup process...');
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: getRedirectUrl(),
            data: {
              full_name: fullName.trim(),
              username: username.trim().toLowerCase(),
              specialty: specialty.trim(),
              email_confirm: true
            }
          },
        });

        console.log('Signup response:', { data, error });

        if (error) {
          handleSupabaseError(error);
          return;
        }

        if (data.user) {
          setPendingEmail(email);
          setEmailSent(true);
          
          // Clear form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
          setUsername("");
          setSpecialty("");
          
          console.log('Signup successful, email sent to:', email);
        }
      } else {
        console.log('Starting signin process...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        console.log('Signin response:', { data, error });

        if (error) {
          handleSupabaseError(error);
          return;
        }

        if (data.user) {
          if (!data.user.email_confirmed_at) {
            Alert.alert(
              'Email Not Verified',
              'Please check your email and click the verification link to complete your account setup.',
              [
                { text: 'Resend Email', onPress: () => resendConfirmation() },
                { text: 'OK', style: 'default' }
              ]
            );
            return;
          }

          console.log('Signin successful');
          Alert.alert("Welcome Back!", "You're now signed in.");
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      handleSupabaseError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async () => {
    const emailToResend = pendingEmail || email;
    
    if (!emailToResend) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Resending confirmation email to:', emailToResend);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToResend.trim().toLowerCase(),
        options: {
          emailRedirectTo: getRedirectUrl()
        }
      });

      if (error) {
        console.error('Resend error:', error);
        handleSupabaseError(error);
      } else {
        Alert.alert('Email Sent!', 'A new verification email has been sent to your inbox.');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      handleSupabaseError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.emailSentContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color="#10B981" />
            </View>
            
            <Text style={styles.emailSentTitle}>Check Your Email!</Text>
            <Text style={styles.emailSentSubtitle}>
              We've sent a verification link to:
            </Text>
            <Text style={styles.emailAddress}>{pendingEmail}</Text>
            
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Next steps:</Text>
              <Text style={styles.instructionText}>
                1. Check your email inbox (and spam folder)
              </Text>
              <Text style={styles.instructionText}>
                2. Click the "Confirm Email" link
              </Text>
              <Text style={styles.instructionText}>
                3. You'll be redirected back to sign in
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={resendConfirmation}
              disabled={isLoading}
            >
              <Text style={styles.resendButtonText}>
                {isLoading ? 'Sending...' : 'Resend Email'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                setEmailSent(false);
                setPendingEmail("");
                setIsSignUp(false);
              }}
            >
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Stethoscope size={40} color="#6366F1" />
            </View>
            <Text style={styles.title}>Nurse Prompt Hub</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? "Create your account" : "Welcome back"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {isSignUp && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name *"
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username *"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={specialty}
                    onChangeText={setSpecialty}
                    placeholder="Specialty (e.g., ICU, ER, Med-Surg) *"
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#9CA3AF"
                />
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
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Please wait...' : (isSignUp ? "Create Account" : "Sign In")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleText}>
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "New to Nurse Prompt Hub? Sign up"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Configuration Status */}
          {!isSupabaseConfigured && (
            <View style={styles.configSection}>
              <AlertCircle size={20} color="#F59E0B" />
              <Text style={styles.configText}>
                Supabase not configured - Demo mode available
              </Text>
              <TouchableOpacity style={styles.demoButton} onPress={handleDemoMode}>
                <Text style={styles.demoButtonText}>Try Demo Mode</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Setup Instructions */}
          {!isSupabaseConfigured && (
            <View style={styles.setupInstructions}>
              <Text style={styles.setupTitle}>To enable authentication:</Text>
              <Text style={styles.setupText}>
                1. Create a Supabase project at supabase.com{'\n'}
                2. Copy your Project URL and anon key{'\n'}
                3. Update the .env file with your credentials{'\n'}
                4. Restart the development server
              </Text>
            </View>
          )}

          {/* Email Verification Notice */}
          {isSignUp && isSupabaseConfigured && (
            <View style={styles.emailNotice}>
              <Text style={styles.emailNoticeText}>
                📧 You'll receive a verification email after signing up. Please check your inbox and spam folder.
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  inner: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 24 
  },
  keyboard: { 
    flex: 1, 
    justifyContent: "center" 
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1F2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  passwordInput: {
    paddingRight: 40,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  passwordRequirements: {
    marginBottom: 16,
  },
  requirementsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: 'center',
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleText: {
    color: "#6366F1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    fontWeight: '500',
  },
  configSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  configText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  demoButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  setupInstructions: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  setupText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  emailNotice: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Email sent confirmation styles
  emailSentContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  emailSentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailSentSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 32,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  resendButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '500',
  },
});