import React, { useState } from 'react';
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
import { fetchPrompts, PromptWithUser } from '@/lib/fetchPrompts';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Code Blue Debrief', label: 'Code Blue Debrief' },
  { id: 'Burnout Self-Check', label: 'Burnout Self-Check' },
  { id: 'Shift Report Prep', label: 'Shift Report Prep' },
  { id: 'Prioritization Support', label: 'Prioritization Support' },
  { id: 'Care Plan Helper', label: 'Care Plan Helper' },
  { id: 'Self-Care', label: 'Self-Care' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category as string || 'all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [prompts, setPrompts] = useState<PromptWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const results = await fetchPrompts({
        search: searchTerm.trim(),
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: 50,
      });
      setPrompts(results);
    } catch (error) {
      console.error('Search error:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch();
  };

  const handlePromptPress = (promptId: string) => {
    router.push({
      pathname: '/prompt-detail',
      params: { id: promptId }
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPrompts([]);
    setHasSearched(false);
  };

  const getSelectedCategoryLabel = () => {
    return CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'All Categories';
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryFilter(false);
    // If we've already searched, re-run the search with new category
    if (hasSearched && searchTerm.trim()) {
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  };

  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search nursing prompts..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.searchButton,
          !searchTerm.trim() && styles.searchButtonDisabled
        ]}
        onPress={handleSearchSubmit}
        disabled={!searchTerm.trim()}
      >
        <Text style={[
          styles.searchButtonText,
          !searchTerm.trim() && styles.searchButtonTextDisabled
        ]}>
          Search
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilterContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowCategoryFilter(!showCategoryFilter)}
      >
        <Filter size={20} color="#6366F1" />
        <Text style={styles.filterButtonText}>{getSelectedCategoryLabel()}</Text>
        <ChevronDown 
          size={16} 
          color="#6366F1" 
          style={[
            styles.chevron,
            showCategoryFilter && styles.chevronRotated
          ]}
        />
      </TouchableOpacity>

      {showCategoryFilter && (
        <View style={styles.categoryDropdown}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                selectedCategory === category.id && styles.selectedCategoryOption
              ]}
              onPress={() => handleCategorySelect(category.id)}
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
      )}
    </View>
  );

  const renderPromptCard = ({ item, index }: { item: PromptWithUser; index: number }) => (
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
          {Math.random() > 0.8 && (
            <View style={[styles.badge, styles.popularBadge]}>
              <TrendingUp size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>Popular</Text>
            </View>
          )}
          {Math.random() > 0.9 && (
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
        {item.content.substring(0, 120)}...
      </Text>
      
      <View style={styles.promptFooter}>
        <View style={[
          styles.difficultyBadge,
          item.difficulty_level === 'beginner' && styles.beginnerBadge,
          item.difficulty_level === 'intermediate' && styles.intermediateBadge,
          item.difficulty_level === 'advanced' && styles.advancedBadge,
        ]}>
          <Text style={[
            styles.difficultyText,
            item.difficulty_level === 'beginner' && styles.beginnerText,
            item.difficulty_level === 'intermediate' && styles.intermediateText,
            item.difficulty_level === 'advanced' && styles.advancedText,
          ]}>
            {item.difficulty_level}
          </Text>
        </View>
        <Clock size={12} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (!hasSearched) {
      return (
        <View style={styles.placeholderContainer}>
          <Search size={64} color="#D1D5DB" />
          <Text style={styles.placeholderTitle}>Search Nursing Prompts</Text>
          <Text style={styles.placeholderText}>
            Enter keywords to find prompts that match your needs. Search by title, content, or tags.
          </Text>
          <View style={styles.searchTips}>
            <Text style={styles.searchTipsTitle}>Search Tips:</Text>
            <Text style={styles.searchTip}>• Try keywords like "code blue", "burnout", or "handoff"</Text>
            <Text style={styles.searchTip}>• Use the category filter to narrow results</Text>
            <Text style={styles.searchTip}>• Search for specific specialties like "ICU" or "ER"</Text>
          </View>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Searching prompts...</Text>
        </View>
      );
    }

    if (prompts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Search size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No prompts found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search terms or category filter
          </Text>
          <TouchableOpacity 
            style={styles.clearSearchButton}
            onPress={clearSearch}
          >
            <Text style={styles.clearSearchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} found for "{searchTerm}"
        </Text>
        <FlatList
          data={prompts}
          renderItem={renderPromptCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.promptsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderSearchHeader()}
      {renderCategoryFilter()}
      {renderContent()}
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
  searchButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#9CA3AF',
  },
  categoryFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  categoryDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategoryOption: {
    backgroundColor: '#F0F4FF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryOptionText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  searchTips: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'stretch',
  },
  searchTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  searchTip: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  clearSearchButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
});