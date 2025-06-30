import React, { useState, useEffect } from 'react';
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
  ScrollView,
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
import { CATEGORIES } from './categories';

const { width: screenWidth } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category as string || 'all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [prompts, setPrompts] = useState<PromptWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // If category was passed as a param, perform search with that category
    if (params.category && params.category !== 'all') {
      setSelectedCategory(params.category as string);
      handleCategorySearch(params.category as string);
    }
  }, [params.category]);

  const handleSearch = async () => {
    if (!searchTerm.trim() && selectedCategory === 'all') return;

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

  const handleCategorySearch = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm(categoryId === 'all' ? '' : categoryId);
    
    // If it's not "all", perform search with the category
    if (categoryId !== 'all') {
      setLoading(true);
      setHasSearched(true);
      
      fetchPrompts({
        category: categoryId,
        limit: 50,
      })
        .then(results => {
          setPrompts(results);
        })
        .catch(error => {
          console.error('Category search error:', error);
          setPrompts([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset search if "all" is selected
      setHasSearched(false);
      setPrompts([]);
    }
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
    setSelectedCategory('all');
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
          (!searchTerm.trim() && selectedCategory === 'all') && styles.searchButtonDisabled
        ]}
        onPress={handleSearchSubmit}
        disabled={!searchTerm.trim() && selectedCategory === 'all'}
      >
        <Text style={[
          styles.searchButtonText,
          (!searchTerm.trim() && selectedCategory === 'all') && styles.searchButtonTextDisabled
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

  const renderCategoryChips = () => (
    <View style={styles.categoryChipsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsScrollContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            onPress={() => handleCategorySearch(category.id)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.selectedCategoryChipText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
        <View style={styles.promptMeta}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.metaText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
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
            <Text style={styles.searchTip}>• Try keywords like "wound", "confused patient", or "NG tube"</Text>
            <Text style={styles.searchTip}>• No need to pick a category - search for any problem or task</Text>
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
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} found
          {searchTerm ? ` for "${searchTerm}"` : selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
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
      
      {/* Show category chips only when no search has been performed */}
      {!hasSearched && renderCategoryChips()}
      
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
  // Category chips styles
  categoryChipsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryChipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryChip: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  promptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});