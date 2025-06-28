import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Auth } from '@/components/Auth';
import { PromptList } from '@/components/PromptList';
import { useUser } from '@/hooks/useUser';
import { fetchPromptsByUser } from '@/lib/fetchPrompts';
import { Database } from '@/types/database';
import { User, CreditCard as Edit3, Save, X, LogOut, Heart, FileText, LogIn } from 'lucide-react-native';

type Prompt = Database['public']['Tables']['prompts']['Row'];

export default function ProfileScreen() {
  const { user, profile, isLoading, updateProfile, signOut } = useUser();
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    specialty: '',
    years_experience: 0,
    bio: '',
  });
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setEditForm({
        full_name: profile.full_name || '',
        specialty: profile.specialty || '',
        years_experience: profile.years_experience || 0,
        bio: profile.bio || '',
      });
      loadUserPrompts();
    }
  }, [user, profile]);

  const loadUserPrompts = async () => {
    if (!user) return;
    
    try {
      setLoadingPrompts(true);
      const prompts = await fetchPromptsByUser(user.id);
      setUserPrompts(prompts);
    } catch (error) {
      console.error('Error loading user prompts:', error);
      Alert.alert('Error', 'Failed to load your prompts');
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  const handlePromptPress = (prompt: Prompt) => {
    console.log('Selected prompt:', prompt.title);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <View style={styles.guestHeader}>
            <View style={styles.guestAvatar}>
              <User size={48} color="#14B8A6" />
            </View>
            <Text style={styles.guestTitle}>Join the Community</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to save prompts, track your contributions, and connect with fellow nurses
            </Text>
          </View>

          <View style={styles.guestFeatures}>
            <View style={styles.featureItem}>
              <FileText size={24} color="#14B8A6" />
              <Text style={styles.featureTitle}>Submit Prompts</Text>
              <Text style={styles.featureDescription}>
                Share your nursing scenarios and help the community learn
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Heart size={24} color="#EF4444" />
              <Text style={styles.featureTitle}>Save Favorites</Text>
              <Text style={styles.featureDescription}>
                Bookmark prompts for quick access and future reference
              </Text>
            </View>

            <View style={styles.featureItem}>
              <User size={24} color="#3B82F6" />
              <Text style={styles.featureTitle}>Build Profile</Text>
              <Text style={styles.featureDescription}>
                Showcase your expertise and connect with peers
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => setShowAuth(true)}
          >
            <LogIn size={20} color="#FFFFFF" />
            <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showAuth}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <Auth
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <User size={40} color="#14B8A6" />
            </View>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <X size={20} color="#6B7280" />
              ) : (
                <Edit3 size={20} color="#14B8A6" />
              )}
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.full_name}
                  onChangeText={(text) => setEditForm({...editForm, full_name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialty</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.specialty}
                  onChangeText={(text) => setEditForm({...editForm, specialty: text})}
                  placeholder="e.g., ICU, ER, Pediatrics"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.years_experience.toString()}
                  onChangeText={(text) => setEditForm({...editForm, years_experience: parseInt(text) || 0})}
                  placeholder="Years of nursing experience"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm({...editForm, bio: text})}
                  placeholder="Tell us about yourself and your nursing experience"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile?.full_name || 'Not set'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Specialty</Text>
                <Text style={styles.infoValue}>{profile?.specialty || 'Not set'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>
                  {profile?.years_experience || 0} years
                </Text>
              </View>

              {profile?.bio && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Bio</Text>
                  <Text style={styles.infoValue}>{profile.bio}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Contributions</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <FileText size={24} color="#14B8A6" />
              <Text style={styles.statNumber}>{userPrompts.length}</Text>
              <Text style={styles.statLabel}>Prompts Submitted</Text>
            </View>
            <View style={styles.statItem}>
              <Heart size={24} color="#EF4444" />
              <Text style={styles.statNumber}>
                {userPrompts.reduce((sum, prompt) => sum + prompt.votes, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Votes</Text>
            </View>
          </View>
        </View>

        <View style={styles.promptsSection}>
          <Text style={styles.sectionTitle}>Your Prompts</Text>
          {userPrompts.length > 0 ? (
            <PromptList
              prompts={userPrompts}
              onPromptPress={handlePromptPress}
              loading={loadingPrompts}
            />
          ) : (
            <View style={styles.emptyState}>
              <FileText size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No prompts yet</Text>
              <Text style={styles.emptyText}>
                Start contributing to the community by submitting your first prompt!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  guestContainer: {
    flex: 1,
    padding: 20,
  },
  guestHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  guestAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  guestFeatures: {
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  signOutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  promptsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});