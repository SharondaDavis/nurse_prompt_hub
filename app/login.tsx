import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { View, TextInput, Button, Text, Alert } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSupabaseError = (error: any) => {
    if (error.message?.includes('captcha verification process failed')) {
      Alert.alert(
        'Authentication Configuration Issue',
        'Your Supabase project has reCAPTCHA enabled. To fix this:\n\n1. Go to your Supabase Dashboard\n2. Navigate to Authentication → Settings\n3. Disable reCAPTCHA protection\n\nAlternatively, contact your administrator.',
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert("Login failed", error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        handleSupabaseError(error);
      } else {
        Alert.alert("Logged in!");
      }
    } catch (err: any) {
      handleSupabaseError(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Enter your email"
      />
      <Text>Password</Text>
      <TextInput 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        placeholder="Enter your password"
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}