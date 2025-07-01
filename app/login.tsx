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
import { Mail, Eye, EyeOff, Stethoscope } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

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
        [{ text: 'OK', style: 'default' }]
      );
    } else if (error.message?.includes('Invalid login credentials')) {
      Alert.alert('Invalid Credentials', 'Please check your email and password and try again.');
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

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters long.");
      return;
    }

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
        // Get the current URL for redirect
        const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nurse-prompt-hub.vercel.app';
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${currentUrl}/auth/callback`,
            data: {
              email_confirm: true
            }
          },
        });

        if (error) {
          handleSupabaseError(error);
          return;
        }

        if (data.user) {
          setEmailSent(true);
          Alert.alert(
            "Check Your Email! 📧",
            `We've sent a verification link to ${email}. Please check your email (including spam folder) and click the link to verify your account.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

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
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      setIsLoading(true);
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nurse-prompt-hub.vercel.app';
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${currentUrl}/auth/callback`
        }
      });

      if (error) {
        handleSupabaseError(error);
      } else {
        Alert.alert('Email Sent!', 'A new verification email has been sent to your inbox.');
      }
    } catch (err: any) {
      handleSupabaseError(err);
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Demo Mode Option */}
          {!isSupabaseConfigured && (
            <View style={styles.demoSection}>
              <Text style={styles.demoText}>
                Supabase not configured - Demo mode available
              </Text>
              <TouchableOpacity style={styles.demoButton} onPress={handleDemoMode}>
                <Text style={styles.demoButtonText}>Try Demo Mode</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email Verification Notice */}
          {isSignUp && (
            <View style={styles.emailNotice}>
              <Text style={styles.emailNoticeText}>
                📧 You'll receive a verification email after signing up. Please check your inbox and spam folder.
              </Text>
            </View>
          )}

          {/* Troubleshooting */}
          <View style={styles.troubleshooting}>
            <Text style={styles.troubleshootingTitle}>Having trouble?</Text>
            <Text style={styles.troubleshootingText}>
              • Check your spam folder for verification emails{'\n'}
              • Ensure your email address is correct{'\n'}
              • Try Demo Mode if authentication isn't working
            </Text>
          </View>
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
  demoSection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 12,
  },
  demoButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  troubleshooting: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  troubleshootingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  troubleshootingText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});