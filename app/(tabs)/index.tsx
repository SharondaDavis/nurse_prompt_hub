import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Users, 
  Heart,
  ArrowRight,
  Sparkles,
  BookOpen,
  Stethoscope
} from 'lucide-react-native';
import { supabase } from '@/lib/supabaseClient';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', color: '#6366F1' },
  { id: 'Code Blue Debrief', label: 'Code Blue', color: '#EF4444' },
  { id: 'Burnout Self-Check', label: 'Burnout', color: '#F59E0B' },
  { id: 'Shift Report Prep', label: 'Reports', color: '#10B981' },
  { id: 'Prioritization Support', label: 'Priority', color: '#8B5CF6' },
  { id: 'Care Plan Helper', label: 'Care Plans', color: '#06B6D4' },
  { id: 'Self-Care', label: 'Self-Care', color: '#EC4899' },
];

const FEATURED_PROMPTS = [
  {
    id: '1',
    title: 'Code Blue Debrief Assistant',
    category: 'Code Blue Debrief',
    excerpt: 'Walk through post-code documentation and mindfulness grounding...',
    votes: 24,
    difficulty: 'intermediate',
    isPopular: true,
  },
  {
    id: '2',
    title: 'Post-Shift Reset Coach',
    category: 'Burnout Self-Check',
    excerpt: 'Guide through 4-7-8 breathing and personalized reset strategies...',
    votes: 42,
    difficulty: 'beginner',
    isNew: true,
  },
  {
    id: '3',
    title: 'Clinical Decision Partner',
    category: 'Prioritization Support',
    excerpt: 'Help prioritize tasks during busy shifts with focused questions...',
    votes: 35,
    difficulty: 'advanced',
    isPopular: true,
  },
];

interface Metrics {
  promptCount: number;
  nurseCount: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [metrics, setMetrics] = useState<Metrics>({ promptCount: 0, nurseCount: 0 });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoadingMetrics(true);

      // Check if Supabase is properly configured
      const isSupabaseConfigured = 
        process.env.EXPO_PUBLIC_SUPABASE_URL && 
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

      if (!isSupabaseConfigured) {
        // Use mock data when Supabase is not configured
        setMetrics({ promptCount: 500, nurseCount: 10000 });
        setIsLoadingMetrics(false);
        return;
      }

      // Fetch prompt count
      const { count: promptCount, error: promptError } = await supabase
        .from('prompts')
        .select('id', { count: 'exact', head: true });

      if (promptError) {
        console.error('Error fetching prompt count:', promptError);
      }

      // Fetch nurse count from user_profiles table
      const { count: nurseCount, error: nurseError } = await supabase
        .from('user_profiles')
        .select('username', { count: 'exact', head: true });

      if (nurseError) {
        console.error('Error fetching nurse count:', nurseError);
      }

      setMetrics({
        promptCount: promptCount || 0,
        nurseCount: nurseCount || 0,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Fallback to default values on error
      setMetrics({ promptCount: 500, nurseCount: 10000 });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push({
      pathname: '/(tabs)/search',
      params: { category: categoryId }
    });
  };

  const handlePromptPress = (promptId: string) => {
    router.push({
      pathname: '/prompt-detail',
      params: { id: promptId }
    });
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`;
    }
    return `${count}+`;
  };

  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
        style={styles.heroImage}
      />
      <View style={styles.heroOverlay}>
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <Stethoscope size={32} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Nurse Prompt Hub</Text>
          </View>
          <Text style={styles.heroSubtitle}>
            AI-powered prompts designed by nurses, for nurses. Enhance your practice with expert-crafted scenarios.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <BookOpen size={20} color="#FFFFFF" />
              <Text style={styles.statText}>
                {isLoadingMetrics ? '...' : `${formatCount(metrics.promptCount)} Prompts`}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Users size={20} color="#FFFFFF" />
              <Text style={styles.statText}>
                {isLoadingMetrics ? '...' : `${formatCount(metrics.nurseCount)} Nurses`}
              </Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#FFFFFF" />
              <Text style={styles.statText}>Growing Daily</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCategoryChips = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Browse by Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              { backgroundColor: category.color },
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            onPress={() => handleCategoryPress(category.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryChipText}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedPrompts = () => (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Prompts</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleSearchPress}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ArrowRight size={16} color="#6366F1" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptsContainer}
      >
        {FEATURED_PROMPTS.map((prompt) => (
          <TouchableOpacity
            key={prompt.id}
            style={styles.promptCard}
            onPress={() => handlePromptPress(prompt.id)}
            activeOpacity={0.9}
          >
            <View style={styles.promptCardHeader}>
              <View style={styles.promptBadges}>
                {prompt.isPopular && (
                  <View style={[styles.badge, styles.popularBadge]}>
                    <TrendingUp size={12} color="#FFFFFF" />
                    <Text style={styles.badgeText}>Popular</Text>
                  </View>
                )}
                {prompt.isNew && (
                  <View style={[styles.badge, styles.newBadge]}>
                    <Sparkles size={12} color="#FFFFFF" />
                    <Text style={styles.badgeText}>New</Text>
                  </View>
                )}
              </View>
              <View style={styles.promptVotes}>
                <Heart size={14} color="#EF4444" />
                <Text style={styles.votesText}>{prompt.votes}</Text>
              </View>
            </View>
            
            <Text style={styles.promptTitle} numberOfLines={2}>
              {prompt.title}
            </Text>
            
            <View style={styles.promptCategory}>
              <Text style={styles.categoryText}>{prompt.category}</Text>
            </View>
            
            <Text style={styles.promptExcerpt} numberOfLines={3}>
              {prompt.excerpt}
            </Text>
            
            <View style={styles.promptFooter}>
              <View style={[
                styles.difficultyBadge,
                prompt.difficulty === 'beginner' && styles.beginnerBadge,
                prompt.difficulty === 'intermediate' && styles.intermediateBadge,
                prompt.difficulty === 'advanced' && styles.advancedBadge,
              ]}>
                <Text style={styles.difficultyText}>{prompt.difficulty}</Text>
              </View>
              <Clock size={14} color="#6B7280" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchCTA = () => (
    <View style={styles.searchCTASection}>
      <TouchableOpacity 
        style={styles.searchCTAButton}
        onPress={handleSearchPress}
        activeOpacity={0.9}
      >
        <View style={styles.searchCTAContent}>
          <Search size={24} color="#6366F1" />
          <View style={styles.searchCTAText}>
            <Text style={styles.searchCTATitle}>Search All Prompts</Text>
            <Text style={styles.searchCTASubtitle}>
              Find exactly what you need from our growing library
            </Text>
          </View>
          <ArrowRight size={20} color="#6366F1" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {renderHeroSection()}
        {renderCategoryChips()}
        {renderFeaturedPrompts()}
        {renderSearchCTA()}
        
        <View style={styles.bottomSpacing} />
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
  heroSection: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99, 102, 241, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 600,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
    marginBottom: 24,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategoryChip: {
    transform: [{ scale: 1.05 }],
  },
  categoryChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredSection: {
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  promptsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  promptCard: {
    width: screenWidth * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promptBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularBadge: {
    backgroundColor: '#EF4444',
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  promptVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  votesText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  promptCategory: {
    marginBottom: 12,
  },
  categoryText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptExcerpt: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  beginnerBadge: {
    backgroundColor: '#DCFCE7',
  },
  intermediateBadge: {
    backgroundColor: '#FEF3C7',
  },
  advancedBadge: {
    backgroundColor: '#FEE2E2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  searchCTASection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  searchCTAButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  searchCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchCTAText: {
    flex: 1,
  },
  searchCTATitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  searchCTASubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});