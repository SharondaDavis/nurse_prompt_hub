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
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Heart, 
  FileText, 
  Settings, 
  Moon, 
  Sun,
  LogIn,
  Bookmark,
  TrendingUp,
  Clock,
  ChevronRight,
  Award
} from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';

// Mock data for demonstration
const MOCK_USER = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@hospital.com',
  specialty: 'ICU Nurse',
  experience: '8 years',
  joinedDate: '2023-01-15',
  avatar: null,
};

const MOCK_CONTRIBUTIONS = [
  {
    id: 'contrib-1',
    title: 'Code Blue Response Protocol',
    category: 'Code Blue Debrief',
    votes: 24,
    createdAt: '2024-01-15',
    status: 'published',
  },
  {
    id: 'contrib-2',
    title: 'Post-Shift Mindfulness Guide',
    category: 'Self-Care',
    votes: 18,
    createdAt: '2024-01-10',
    status: 'published',
  },
  {
    id: 'contrib-3',
    title: 'ICU Handoff Checklist',
    category: 'Shift Report Prep',
    votes: 31,
    createdAt: '2024-01-05',
    status: 'under_review',
  },
];

export default function Profile2Screen() {
  const router = useRouter();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Mock auth state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites', 'contributions', 'settings'

  const handleSignIn = () => {
    setIsAuthenticated(true);
    Alert.alert('Success', 'You are now signed in!');
  };

  const handlePromptPress = (promptId: string) => {
    router.push({
      pathname: '/prompt-detail',
      params: { id: promptId }
    });
  };

  const renderUnauthenticatedView = () => (
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
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <User size={32} color="#6366F1" />
        </View>
      </View>
      
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{MOCK_USER.name}</Text>
        <Text style={styles.profileSpecialty}>{MOCK_USER.specialty}</Text>
        <Text style={styles.profileExperience}>{MOCK_USER.experience} experience</Text>
      </View>
      
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{MOCK_CONTRIBUTIONS.length}</Text>
          <Text style={styles.statLabel}>Contributions</Text>
        </View>
      </View>
    </View>
  );

  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
        onPress={() => setActiveTab('favorites')}
      >
        <Heart size={20} color={activeTab === 'favorites' ? '#6366F1' : '#6B7280'} />
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
        <FileText size={20} color={activeTab === 'contributions' ? '#6366F1' : '#6B7280'} />
        <Text style={[
          styles.tabText,
          activeTab === 'contributions' && styles.activeTabText
        ]}>
          Contributions
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
        onPress={() => setActiveTab('settings')}
      >
        <Settings size={20} color={activeTab === 'settings' ? '#6366F1' : '#6B7280'} />
        <Text style={[
          styles.tabText,
          activeTab === 'settings' && styles.activeTabText
        ]}>
          Settings
        </Text>
      </TouchableOpacity>
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
            onPress={() => router.push('/(tabs)/search2')}
          >
            <Text style={styles.exploreButtonText}>Explore Prompts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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
      {MOCK_CONTRIBUTIONS.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No contributions yet</Text>
          <Text style={styles.emptyText}>
            Share your nursing expertise by submitting your first prompt
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/submit2')}
          >
            <Text style={styles.exploreButtonText}>Submit a Prompt</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {MOCK_CONTRIBUTIONS.map((contribution) => (
            <TouchableOpacity
              key={contribution.id}
              style={styles.promptCard}
              onPress={() => handlePromptPress(contribution.id)}
              activeOpacity={0.9}
            >
              <View style={styles.promptCardHeader}>
                <View style={styles.promptCategory}>
                  <Text style={styles.promptCategoryText}>{contribution.category}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  contribution.status === 'published' && styles.publishedBadge,
                  contribution.status === 'under_review' && styles.reviewBadge,
                ]}>
                  <Text style={[
                    styles.statusText,
                    contribution.status === 'published' && styles.publishedText,
                    contribution.status === 'under_review' && styles.reviewText,
                  ]}>
                    {contribution.status === 'published' ? 'Published' : 'Under Review'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.promptTitle} numberOfLines={2}>
                {contribution.title}
              </Text>
              
              <View style={styles.contributionStats}>
                <View style={styles.contributionStat}>
                  <TrendingUp size={14} color="#EF4444" />
                  <Text style={styles.contributionStatText}>{contribution.votes} votes</Text>
                </View>
                <View style={styles.contributionStat}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.contributionStatText}>
                    {new Date(contribution.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.promptFooter}>
                <View />
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
              {isDarkMode ? (
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
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
            thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem}>
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
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Settings size={20} color="#6B7280" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Preferences</Text>
              <Text style={styles.settingDescription}>
                Notification and privacy settings
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        {renderUnauthenticatedView()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderTabNavigation()}
        
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
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
  profileSpecialty: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 2,
  },
  profileExperience: {
    fontSize: 14,
    color: '#6B7280',
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
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
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
  // Contributions
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  publishedBadge: {
    backgroundColor: '#DCFCE7',
  },
  reviewBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  publishedText: {
    color: '#166534',
  },
  reviewText: {
    color: '#92400E',
  },
  contributionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  contributionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contributionStatText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});