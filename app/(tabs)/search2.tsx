import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  Heart,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const ITEMS_PER_PAGE = 20;

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Code Blue Debrief', label: 'Code Blue Debrief' },
  { id: 'Burnout Self-Check', label: 'Burnout Self-Check' },
  { id: 'Shift Report Prep', label: 'Shift Report Prep' },
  { id: 'Prioritization Support', label: 'Prioritization Support' },
  { id: 'Care Plan Helper', label: 'Care Plan Helper' },
  { id: 'Self-Care', label: 'Self-Care' },
];

// Mock data for demonstration
const MOCK_PROMPTS = Array.from({ length: 100 }, (_, index) => ({
  id: `prompt-${index + 1}`,
  title: `Nursing Prompt ${index + 1}`,
  category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1].id,
  excerpt: `This is a sample nursing prompt excerpt that demonstrates the content. It provides valuable insights for healthcare professionals...`,
  votes: Math.floor(Math.random() * 50) + 1,
  difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
  isPopular: Math.random() > 0.8,
  isNew: Math.random() > 0.9,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function Search2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category as string || 'all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setPage(0);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredPrompts = MOCK_PROMPTS;
    
    if (searchQuery.trim()) {
      filteredPrompts = filteredPrompts.filter(prompt =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filteredPrompts = filteredPrompts.filter(prompt =>
        prompt.category === selectedCategory
      );
    }
    
    const firstPage = filteredPrompts.slice(0, ITEMS_PER_PAGE);
    setPrompts(firstPage);
    setHasMore(filteredPrompts.length > ITEMS_PER_PAGE);
    setLoading(false);
  }, [searchQuery, selectedCategory]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredPrompts = MOCK_PROMPTS;
    
    if (searchQuery.trim()) {
      filteredPrompts = filteredPrompts.filter(prompt =>
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filteredPrompts = filteredPrompts.filter(prompt =>
        prompt.category === selectedCategory
      );
    }
    
    const start = nextPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const newPrompts = filteredPrompts.slice(start, end);
    
    setPrompts(prev => [...prev, ...newPrompts]);
    setPage(nextPage);
    setHasMore(end < filteredPrompts.length);
    setLoadingMore(false);
  }, [page, searchQuery, selectedCategory, loadingMore, hasMore]);

  const handlePromptPress = (promptId: string) => {
    router.push({
      pathname: '/prompt-detail',
      params: { id: promptId }
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search nursing prompts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowCategoryFilter(!showCategoryFilter)}
      >
        <Filter size={20} color="#6366F1" />
        <ChevronDown 
          size={16} 
          color="#6366F1" 
          style={[
            styles.chevron,
            showCategoryFilter && styles.chevronRotated
          ]}
        />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryFilter = () => {
    if (!showCategoryFilter) return null;
    
    return (
      <View style={styles.categoryFilter}>
        <Text style={styles.filterTitle}>Filter by Category</Text>
        <View style={styles.categoryOptions}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                selectedCategory === category.id && styles.selectedCategoryOption
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                setShowCategoryFilter(false);
              }}
            >
              <Text style={[
                styles.categoryOptionText,
                selectedCategory === category.id && styles.selectedCategoryOptionText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPromptCard = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.promptCard,
        index % 2 === 0 ? styles.promptCardLeft : styles.promptCardRight
      ]}
      onPress={() => handlePromptPress(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.promptCardHeader}>
        <View style={styles.promptBadges}>
          {item.isPopular && (
            <View style={[styles.badge, styles.popularBadge]}>
              <TrendingUp size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>Popular</Text>
            </View>
          )}
          {item.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Sparkles size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>New</Text>
            </View>
          )}
        </View>
        <View style={styles.promptVotes}>
          <Heart size={12} color="#EF4444" />
          <Text style={styles.votesText}>{item.votes}</Text>
        </View>
      </View>
      
      <Text style={styles.promptTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <View style={styles.promptCategory}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      
      <Text style={styles.promptExcerpt} numberOfLines={3}>
        {item.excerpt}
      </Text>
      
      <View style={styles.promptFooter}>
        <View style={[
          styles.difficultyBadge,
          item.difficulty === 'beginner' && styles.beginnerBadge,
          item.difficulty === 'intermediate' && styles.intermediateBadge,
          item.difficulty === 'advanced' && styles.advancedBadge,
        ]}>
          <Text style={[
            styles.difficultyText,
            item.difficulty === 'beginner' && styles.beginnerText,
            item.difficulty === 'intermediate' && styles.intermediateText,
            item.difficulty === 'advanced' && styles.advancedText,
          ]}>
            {item.difficulty}
          </Text>
        </View>
        <Clock size={12} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.loadingText}>Loading more prompts...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Search size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No prompts found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search terms or category filter
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderSearchHeader()}
      {renderCategoryFilter()}
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {loading ? 'Searching...' : `${prompts.length} prompts found`}
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Searching prompts...</Text>
        </View>
      ) : (
        <FlatList
          data={prompts}
          renderItem={renderPromptCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.promptsList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  categoryFilter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedCategoryOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  promptsList: {
    padding: 16,
    gap: 16,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  promptCardLeft: {
    width: (screenWidth - 48) / 2,
    marginRight: 8,
  },
  promptCardRight: {
    width: (screenWidth - 48) / 2,
    marginLeft: 8,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promptBadges: {
    flexDirection: 'column',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  popularBadge: {
    backgroundColor: '#EF4444',
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
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
    marginBottom: 6,
    lineHeight: 20,
  },
  promptCategory: {
    marginBottom: 8,
  },
  categoryText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptExcerpt: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
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
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  beginnerText: {
    color: '#166534',
  },
  intermediateText: {
    color: '#92400E',
  },
  advancedText: {
    color: '#991B1B',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
  },
});