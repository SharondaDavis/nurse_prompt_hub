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
  Heart,
  ArrowRight,
  Sparkles,
  Stethoscope
} from 'lucide-react-native';
import { CATEGORIES } from '@/lib/categories';

const { width: screenWidth } = Dimensions.get('window');

const FEATURED_PROMPTS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Code Blue Debrief Assistant',
    category: 'emergency',
    excerpt: 'Walk through post-code documentation and mindfulness grounding...',
    votes: 24,
    isPopular: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Post-Shift Reset Coach',
    category: 'selfcare',
    excerpt: 'Guide through 4-7-8 breathing and personalized reset strategies...',
    votes: 42,
    isNew: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Clinical Decision Partner',
    category: 'prioritization',
    excerpt: 'Help prioritize tasks during busy shifts with focused questions...',
    votes: 35,
    isPopular: true,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [metrics, setMetrics] = useState({ promptCount: 500, nurseCount: 10000 });

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push({
      pathname: '/(tabs)/search',
      params: { category: categoryId }
    });
  };

  const handlePromptPress = (promptId: string) => {
    router.push(`/prompt-detail/${promptId}`);
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
        </View>
      </View>
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
              <Text style={styles.categoryText}>
                {CATEGORIES.find(cat => cat.id === prompt.category)?.label || prompt.category}
              </Text>
            </View>
            
            <Text style={styles.promptExcerpt} numberOfLines={3}>
              {prompt.excerpt}
            </Text>
            
            <View style={styles.promptFooter}>
              <View style={styles.promptMeta}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.metaText}>Recently added</Text>
              </View>
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
            <Text style={styles.searchCTATitle}>Search Nursing Prompts</Text>
            <Text style={styles.searchCTASubtitle}>
              Find exactly what you need - search by problem, task, or keyword
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
    height: 280,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  promptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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