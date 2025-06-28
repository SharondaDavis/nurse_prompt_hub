import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { MyPromptsToggle } from '@/components/MyPromptsToggle';
import { PromptList } from '@/components/PromptList';
import { PromptForm } from '@/components/PromptForm';
import { Auth } from '@/components/Auth';
import { PromptDetail } from '@/components/PromptDetail';
import { fetchPrompts, getTotalPromptsCount, PromptWithUser } from '@/lib/fetchPrompts';
import { Database } from '@/types/database';
import { useUser } from '@/hooks/useUser';
import { Plus, BookOpen, Users, TrendingUp, Stethoscope, LogIn, ArrowRight, Star, Zap } from 'lucide-react-native';

type Prompt = Database['public']['Tables']['prompts']['Row'];

const PROMPTS_PER_PAGE = 5;

export default function HomeScreen() {
  const { user } = useUser();
  const [prompts, setPrompts] = useState<PromptWithUser[]>([]);
  const [myPrompts, setMyPrompts] = useState<PromptWithUser[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithUser | null>(null);
  const [showPromptDetail, setShowPromptDetail] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMyPrompts, setShowMyPrompts] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePrompts, setHasMorePrompts] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadPrompts(true); // Reset on initial load
  }, []);

  useEffect(() => {
    if (user) {
      loadMyPrompts();
    } else {
      setMyPrompts([]);
      setShowMyPrompts(false);
    }
  }, [user]);

  useEffect(() => {
    // Reset pagination when filters change
    setCurrentPage(0);
    setFilteredPrompts([]);
    loadPrompts(true);
  }, [searchQuery, selectedCategory, selectedSpecialty, showMyPrompts]);

  const loadPrompts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentPage(0);
        setFilteredPrompts([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : currentPage + 1;
      const offset = page * PROMPTS_PER_PAGE;

      const options = {
        limit: PROMPTS_PER_PAGE,
        offset,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        search: searchQuery.trim() || undefined,
        userId: showMyPrompts && user ? user.id : undefined,
      };

      const [newPrompts, count] = await Promise.all([
        fetchPrompts(options),
        getTotalPromptsCount({
          category: options.category,
          specialty: options.specialty,
          search: options.search,
          userId: options.userId,
        })
      ]);

      if (reset) {
        setFilteredPrompts(newPrompts);
        setPrompts(showMyPrompts ? [] : newPrompts);
      } else {
        setFilteredPrompts(prev => [...prev, ...newPrompts]);
        if (!showMyPrompts) {
          setPrompts(prev => [...prev, ...newPrompts]);
        }
      }

      setCurrentPage(page);
      setTotalCount(count);
      setHasMorePrompts(offset + newPrompts.length < count);

    } catch (error) {
      console.error('Error loading prompts:', error);
      if (reset) {
        Alert.alert('Error', 'Failed to load prompts. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMyPrompts = async () => {
    if (!user) return;
    
    try {
      const data = await fetchPrompts({ userId: user.id, limit: 100 }); // Load all user prompts
      setMyPrompts(data);
    } catch (error) {
      console.error('Error loading my prompts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrompts(true);
    if (user) {
      await loadMyPrompts();
    }
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMorePrompts) {
      loadPrompts(false);
    }
  };

  const handlePromptPress = (prompt: PromptWithUser) => {
    setSelectedPrompt(prompt);
    setShowPromptDetail(true);
  };

  const handleSubmitPress = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowSubmitForm(true);
    }
  };

  const handleAddPromptPress = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowSubmitForm(true);
    }
  };

  const handleFormSuccess = (newPrompt: Prompt) => {
    // Create a PromptWithUser object for the new prompt
    const promptWithUser: PromptWithUser = {
      ...newPrompt,
      user_profiles: user ? {
        username: user.email?.split('@')[0] || 'new_user',
        full_name: 'Current User',
        specialty: 'General',
      } : undefined,
    };

    // Add to the beginning of the lists
    setPrompts(prevPrompts => [promptWithUser, ...prevPrompts]);
    setFilteredPrompts(prevFiltered => [promptWithUser, ...prevFiltered]);

    // If the new prompt is by the current user, add it to myPrompts
    if (user && newPrompt.created_by === user.id) {
      setMyPrompts(prevMyPrompts => [promptWithUser, ...prevMyPrompts]);
    }
    
    setShowSubmitForm(false);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleToggleMyPrompts = (showMy: boolean) => {
    setShowMyPrompts(showMy);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
        style={styles.heroImage}
      />
      <View style={styles.heroOverlay}>
        <View style={styles.heroContent}>
          <View style={styles.heroLogo}>
            <Stethoscope size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Nurse Prompt Hub</Text>
          <Text style={styles.heroSubtitle}>
            Discover, share, and learn from real nursing scenarios crafted by healthcare professionals
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButton} onPress={handleSubmitPress}>
              <Plus size={20} color="#7D3C98" />
              <Text style={styles.heroButtonText}>Submit Prompt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroButtonSecondary}>
              <Text style={styles.heroButtonSecondaryText}>Browse Library</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <BookOpen size={24} color="#7D3C98" />
          </View>
          <Text style={styles.statNumber}>{totalCount}+</Text>
          <Text style={styles.statLabel}>Nursing Prompts</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Users size={24} color="#0072CE" />
          </View>
          <Text style={styles.statNumber}>{new Set(prompts.map(p => p.created_by)).size}+</Text>
          <Text style={styles.statLabel}>Contributors</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <TrendingUp size={24} color="#7D3C98" />
          </View>
          <Text style={styles.statNumber}>{prompts.reduce((sum, p) => sum + p.votes, 0)}+</Text>
          <Text style={styles.statLabel}>Community Votes</Text>
        </View>
      </View>
    </View>
  );

  const renderFeaturesSection = () => (
    <View style={styles.featuresSection}>
      <Text style={styles.featuresTitle}>Why Nurses Choose Our Platform</Text>
      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Star size={24} color="#7D3C98" />
          </View>
          <Text style={styles.featureTitle}>Expert-Curated</Text>
          <Text style={styles.featureDescription}>
            All prompts are created and reviewed by experienced nursing professionals
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Zap size={24} color="#0072CE" />
          </View>
          <Text style={styles.featureTitle}>Real Scenarios</Text>
          <Text style={styles.featureDescription}>
            Practice with authentic clinical situations you'll encounter in your career
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Users size={24} color="#7D3C98" />
          </View>
          <Text style={styles.featureTitle}>Community Driven</Text>
          <Text style={styles.featureDescription}>
            Learn from and contribute to a growing community of healthcare professionals
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAddPromptButton = () => (
    <View style={styles.addPromptSection}>
      <TouchableOpacity
        style={styles.addPromptButton}
        onPress={handleAddPromptPress}
        activeOpacity={0.8}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addPromptButtonText}>
          {user ? 'Add New Prompt' : 'Sign In to Add Prompt'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.addPromptSubtext}>
        Share your nursing expertise with the community
      </Text>
    </View>
  );

  const renderListHeader = () => {
    if (showMyPrompts) {
      return null; // No header sections for My Prompts view
    }

    return (
      <View>
        {renderHeroSection()}
        {renderStatsSection()}
        {renderFeaturesSection()}
        <View style={styles.promptsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Prompts</Text>
            <Text style={styles.sectionSubtitle}>
              Showing {filteredPrompts.length} of {totalCount} prompts
            </Text>
          </View>
          {renderAddPromptButton()}
        </View>
      </View>
    );
  };

  const renderListFooter = () => {
    if (showMyPrompts && myPrompts.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyMyPrompts}>
          <View style={styles.emptyIcon}>
            <Plus size={48} color="#CCCCCC" />
          </View>
          <Text style={styles.emptyTitle}>No prompts yet</Text>
          <Text style={styles.emptyText}>
            Start contributing to the community by submitting your first nursing prompt!
          </Text>
          <TouchableOpacity
            style={styles.emptyActionButton}
            onPress={handleSubmitPress}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>Submit Your First Prompt</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (showMyPrompts) {
      return (
        <View style={styles.myPromptsHeader}>
          <Text style={styles.myPromptsTitle}>My Prompts</Text>
          <Text style={styles.myPromptsSubtitle}>
            You have submitted {myPrompts.length} prompt{myPrompts.length !== 1 ? 's' : ''}
          </Text>
          {renderAddPromptButton()}
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <EnhancedHeader
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      {/* Show My Prompts toggle for all users, but handle auth in the component */}
      <MyPromptsToggle
        showMyPrompts={showMyPrompts}
        onToggle={handleToggleMyPrompts}
        myPromptsCount={myPrompts.length}
        totalPromptsCount={prompts.length}
        user={user}
        onShowAuth={handleShowAuth}
      />

      {/* Single FlatList that handles all content */}
      <PromptList
        prompts={filteredPrompts}
        onPromptPress={handlePromptPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        loading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={hasMorePrompts}
        loadingMore={loadingMore}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
      />

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

      <Modal
        visible={showSubmitForm}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PromptForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowSubmitForm(false)}
        />
      </Modal>

      <Modal
        visible={showPromptDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {selectedPrompt && (
            <PromptDetail
              prompt={selectedPrompt}
              onClose={() => setShowPromptDetail(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  heroSection: {
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(125, 60, 152, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 600,
  },
  heroLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
    marginBottom: 32,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  heroButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  heroButtonText: {
    color: '#7D3C98',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroButtonSecondary: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  heroButtonSecondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 600,
    alignSelf: 'center',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  featuresTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: -0.5,
  },
  featuresGrid: {
    maxWidth: 800,
    alignSelf: 'center',
  },
  featureCard: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  promptsSection: {
    backgroundColor: '#F9F9F9',
    paddingTop: 48,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  myPromptsHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  myPromptsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  myPromptsSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addPromptSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  addPromptButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D3C98',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#7D3C98',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 200,
  },
  addPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  addPromptSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyMyPrompts: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D3C98',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});