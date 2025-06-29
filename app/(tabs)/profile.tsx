import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Heart, FileText, Settings, Moon, Sun, LogIn, Bookmark, TrendingUp, Clock, ChevronRight, Award, ThumbsUp, Edit3, Plus, LogOut } from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@/hooks/useUser';
import { useVoting } from '@/hooks/useVoting';
import { useTheme } from '@/hooks/useTheme';
import { fetchPromptsByUser, PromptWithUser } from '@/lib/fetchPrompts';
import { Auth } from '@/components/Auth';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isLoading: userLoading, signOut } = useUser();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { votes } = useVoting();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'favorites', 'contributions', 'votes', 'settings'
  const [showAuth, setShowAuth] = useState(false);
  const [userPrompts, setUserPrompts] = useState<PromptWithUser[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'contributions') {
      loadUserPrompts();
    }
  }, [user, activeTab]);

  const loadUserPrompts = async () => {
    if (!user) return;
    
    try {
      setLoadingPrompts(true);
      const prompts = await fetchPromptsByUser(user.id);
      setUserPrompts(prompts);
    } catch (error) {
      console.error('Error loading user prompts:', error);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'contributions') {
      await loadUserPrompts();
    }
    setRefreshing(false);
  };

  const handleSignIn = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handlePromptPress = (promptId: string) => {
    router.push({
      pathname: '/prompt-detail',
      params: { id: promptId }
    });
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
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              // The useUser hook will automatically handle the state update
              // No need to manually redirect as the component will re-render
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (userLoading) {
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
        <View style={styles.unauthContainer}>
          <View style={styles.unauthContent}>
            <View style={styles.unauthIcon}>
              <User size={48} color="#6366F1" />
            </View>
            
            <Text style={styles.unauthTitle}>Join the Community</Text>
            <Text style={styles.unauthSubtitle}>
              Sign in to save your favorite prompts, track your contributions, and connect with fellow nurses.
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Heart size={20} color="#EF4444" />
                <Text style={styles.benefitText}>Save favorite prompts</Text>
              </View>
              <View style={styles.benefitItem}>
                <FileText size={20} color="#10B981" />
                <Text style={styles.benefitText}>Track your contributions</Text>
              </View>
              <View style={styles.benefitItem}>
                <Award size={20} color="#F59E0B" />
                <Text style={styles.benefitText}>Build your reputation</Text>
              </View>
              <View style={styles.benefitItem}>
                <ThumbsUp size={20} color="#8B5CF6" />
                <Text style={styles.benefitText}>Vote on prompts</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={handleSignIn}
              activeOpacity={0.9}
            >
              <LogIn size={20} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth Modal */}
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

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <User size={32} color="#6366F1" />
        </View>
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Edit3 size={16} color="#6366F1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profile?.full_name || 'Nurse'}</Text>
        <Text style={styles.profileUsername}>@{profile?.username || 'username'}</Text>
        <Text style={styles.profileSpecialty}>{profile?.specialty || 'General Practice'}</Text>
        <Text style={styles.profileExperience}>{profile?.years_experience || 0} years experience</Text>
      </View>
      
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userPrompts.length}</Text>
          <Text style={styles.statLabel}>Prompts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{votes.length}</Text>
          <Text style={styles.statLabel}>Votes</Text>
        </View>
      </View>
    </View>
  );

  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <User size={18} color={activeTab === 'overview' ? '#6366F1' : '#6B7280'} />
        <Text style={[
          styles.tabText,
          activeTab === 'overview' && styles.activeTabText
        ]}>
          Overview
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
        onPress={() => setActiveTab('favorites')}
      >
        <Heart size={18} color={activeTab === 'favorites' ? '#6366F1' : '#6B7280'} />
        <Text style={[
          styles.tabText,
          activeTab === 'favorites' && styles.activeTabText
        ]}>
          Favorites
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'contributions' && styles.activeTab]}
        onPress={() => setActiveTab('contributions')}
      >
        <FileText size={18} color={activeTab === 'contributions' ? '#6366F1' : '#6B7280'} />
        <Text style={[
          styles.tabText,
          activeTab === 'contributions' && styles.activeTabText
        ]}>
          My Prompts
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
        onPress={() => setActiveTab('settings')}
      >
        <Settings size={18} color={activeTab === 'settings' ? '#6366F1' : '#6B7280'} />
        <Text style={[
          styles.tabText,
          activeTab === 'settings' && styles.activeTabText
        ]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Heart size={20} color="#EF4444" />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Favorites</Text>
              <Text style={styles.activityDescription}>
                You have {favorites.length} saved prompts
              </Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('favorites')}>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityItem}>
            <FileText size={20} color="#10B981" />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Contributions</Text>
              <Text style={styles.activityDescription}>
                You've shared {userPrompts.length} prompts
              </Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('contributions')}>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityItem}>
            <ThumbsUp size={20} color="#8B5CF6" />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Votes Cast</Text>
              <Text style={styles.activityDescription}>
                You've voted on {votes.length} prompts
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/submit')}
          >
            <Plus size={24} color="#6366F1" />
            <Text style={styles.quickActionText}>Submit Prompt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.quickActionText}>Explore Prompts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFavorites = () => (
    <View style={styles.tabContent}>
      {favoritesLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Bookmark size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Start exploring prompts and save your favorites by tapping the heart icon
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.exploreButtonText}>Explore Prompts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {favorites.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptCard}
              onPress={() => handlePromptPress(prompt.id)}
              activeOpacity={0.9}
            >
              <View style={styles.promptCardHeader}>
                <View style={styles.promptCategory}>
                  <Text style={styles.promptCategoryText}>{prompt.category}</Text>
                </View>
                <View style={styles.promptVotes}>
                  <TrendingUp size={14} color="#EF4444" />
                  <Text style={styles.votesText}>{prompt.votes}</Text>
                </View>
              </View>
              
              <Text style={styles.promptTitle} numberOfLines={2}>
                {prompt.title}
              </Text>
              
              <Text style={styles.promptExcerpt} numberOfLines={2}>
                {prompt.excerpt}
              </Text>
              
              <View style={styles.promptFooter}>
                <View style={styles.promptMeta}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.promptDate}>
                    Saved {new Date(prompt.savedAt).toLocaleDateString()}
                  </Text>
                </View>
                <ChevronRight size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderContributions = () => (
    <View style={styles.tabContent}>
      {loadingPrompts ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your prompts...</Text>
        </View>
      ) : userPrompts.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No prompts yet</Text>
          <Text style={styles.emptyText}>
            Share your nursing expertise by submitting your first prompt
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/submit')}
          >
            <Text style={styles.exploreButtonText}>Submit a Prompt</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {userPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptCard}
              onPress={() => handlePromptPress(prompt.id)}
              activeOpacity={0.9}
            >
              <View style={styles.promptCardHeader}>
                <View style={styles.promptCategory}>
                  <Text style={styles.promptCategoryText}>{prompt.category}</Text>
                </View>
                <View style={styles.promptVotes}>
                  <ThumbsUp size={14} color="#6366F1" />
                  <Text style={styles.votesText}>{prompt.votes_count || prompt.votes || 0}</Text>
                </View>
              </View>
              
              <Text style={styles.promptTitle} numberOfLines={2}>
                {prompt.title}
              </Text>
              
              <Text style={styles.promptExcerpt} numberOfLines={2}>
                {prompt.content.substring(0, 120)}...
              </Text>
              
              <View style={styles.promptFooter}>
                <View style={styles.promptMeta}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.promptDate}>
                    Created {new Date(prompt.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <ChevronRight size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              {isDark ? (
                <Moon size={20} color="#6366F1" />
              ) : (
                <Sun size={20} color="#F59E0B" />
              )}
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch between light and dark themes
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <User size={20} color="#6B7280" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingDescription}>
                Update your personal information
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <View style={styles.settingInfo}>
            <View style={[styles.settingIcon, styles.signOutIcon]}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, styles.signOutText]}>Sign Out</Text>
              <Text style={styles.settingDescription}>
                Sign out of your account
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderTabNavigation()}
        
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'favorites' && renderFavorites()}
        {activeTab === 'contributions' && renderContributions()}
        {activeTab === 'settings' && renderSettings()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Unauthenticated View
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  unauthContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  unauthIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  unauthTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  unauthSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'stretch',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Profile Header
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: '40%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  profileSpecialty: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  profileExperience: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  // Tab Content
  tabContent: {
    flex: 1,
    padding: 16,
  },
  // Overview
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Prompt Cards
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptCategory: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promptCategoryText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  promptVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  votesText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  promptExcerpt: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promptDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Settings
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  signOutIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  signOutText: {
    color: '#EF4444',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});