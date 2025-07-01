import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useRouter } from "expo-router";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // toggle between sign in / sign up
  const router = useRouter();

const handleAuth = async () => {
  if (!email || !password) {
    Alert.alert("Missing Info", "Please enter both email and password.");
    return;
  }

  try {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      Alert.alert("Success", "Check your email to confirm your account.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;

      if (!user?.email_confirmed_at) {
        Alert.alert("Email not verified", "Please confirm your email to continue.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.username) {
        Alert.alert("Setup Required", "Finish creating your profile.");
        router.push("/profile-setup");
        return;
      }

      // All good: go to homepage or wherever
      Alert.alert("Welcome", "You're signed in!");
      router.push("/");
    }
  } catch (error: any) {
    if (error.message?.includes("captcha")) {
      Alert.alert(
        "CAPTCHA Error",
        "Disable reCAPTCHA in Supabase Auth Settings if not configured."
      );
    } else {
      Alert.alert("Auth Error", error.message || "Something went wrong.");
    }
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          <Text style={styles.title}>Nurse Prompt Hub</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create a new account" : "Sign in to continue"}
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth}>
            <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? "Already have an account? Sign in here"
                : "Don't have an account? Sign up now"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  keyboard: {
    flex: 1,
    justifyContent: "center",
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
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleText: {
    color: "#4B5563",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },
});
