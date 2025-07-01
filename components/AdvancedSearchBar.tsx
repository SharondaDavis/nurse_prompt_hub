import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  Info
} from 'lucide-react-native';
import { CATEGORIES } from '@/lib/categories';
import { getSearchSuggestions } from '@/lib/advancedSearch';

const { width: screenWidth } = Dimensions.get('window');

const SPECIALTIES = [
  { id: 'all', label: 'All Specialties' },
  { id: 'icu', label: 'ICU' },
  { id: 'er', label: 'Emergency Room' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'med-surg', label: 'Med-Surg' },
  { id: 'oncology', label: 'Oncology' },
  { id: 'cardiac', label: 'Cardiac' },
  { id: 'mental-health', label: 'Mental Health' },
  { id: 'home-health', label: 'Home Health' },
  { id: 'ltc', label: 'Long-term Care' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', icon: Search },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'votes', label: 'Votes', icon: TrendingUp },
  { id: 'popularity', label: 'Popularity', icon: Sparkles },
];

interface AdvancedSearchBarProps {
  onSearch: (options: {
    query: string;
    categories: string[];
    specialties: string[];
    tags: string[];
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }) => void;
  initialQuery?: string;
  initialCategories?: string[];
  initialSpecialties?: string[];
  initialTags?: string[];
  initialSortBy?: string;
  initialSortDirection?: 'asc' | 'desc';
}

export function AdvancedSearchBar({
  onSearch,
  initialQuery = '',
  initialCategories = [],
  initialSpecialties = [],
  initialTags = [],
  initialSortBy = 'relevance',
  initialSortDirection = 'desc',
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [specialties, setSpecialties] = useState<string[]>(initialSpecialties);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const filtersHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Load suggestions when query changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length >= 2) {
        try {
          const results = await getSearchSuggestions(query);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Error loading suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    loadSuggestions();
  }, [query]);

  // Toggle filters animation
  useEffect(() => {
    Animated.timing(filtersHeight, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters, filtersHeight]);

  const handleSearch = () => {
    onSearch({
      query,
      categories,
      specialties,
      tags,
      sortBy,
      sortDirection,
    });
    setShowSuggestions(false);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleClearSearch = () => {
    setQuery('');
    setCategories([]);
    setSpecialties([]);
    setTags([]);
    setSortBy('relevance');
    setSortDirection('desc');
    onSearch({
      query: '',
      categories: [],
      specialties: [],
      tags: [],
      sortBy: 'relevance',
      sortDirection: 'desc',
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      
      // Update search with new tag
      onSearch({
        query,
        categories,
        specialties,
        tags: updatedTags,
        sortBy,
        sortDirection,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    
    // Update search with removed tag
    onSearch({
      query,
      categories,
      specialties,
      tags: updatedTags,
      sortBy,
      sortDirection,
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    let updatedCategories;
    if (categories.includes(categoryId)) {
      updatedCategories = categories.filter(id => id !== categoryId);
    } else {
      updatedCategories = [...categories, categoryId];
    }
    setCategories(updatedCategories);
    
    // Update search with new categories
    onSearch({
      query,
      categories: updatedCategories,
      specialties,
      tags,
      sortBy,
      sortDirection,
    });
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    let updatedSpecialties;
    if (specialties.includes(specialtyId)) {
      updatedSpecialties = specialties.filter(id => id !== specialtyId);
    } else {
      updatedSpecialties = [...specialties, specialtyId];
    }
    setSpecialties(updatedSpecialties);
    
    // Update search with new specialties
    onSearch({
      query,
      categories,
      specialties: updatedSpecialties,
      tags,
      sortBy,
      sortDirection,
    });
  };

  const handleSortChange = (sortOption: string) => {
    if (sortBy === sortOption) {
      // Toggle direction if same sort option is selected
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort option with default direction (desc)
      setSortBy(sortOption);
      setSortDirection('desc');
    }
    setShowSortOptions(false);
    
    // Update search with new sort options
    onSearch({
      query,
      categories,
      specialties,
      tags,
      sortBy: sortOption,
      sortDirection: sortBy === sortOption ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'desc',
    });
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Search size={16} color="#6B7280" />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }: { item: typeof SORT_OPTIONS[0] }) => {
    const Icon = item.icon;
    const isSelected = sortBy === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.sortOption, isSelected && styles.selectedSortOption]}
        onPress={() => handleSortChange(item.id)}
      >
        <Icon size={16} color={isSelected ? "#FFFFFF" : "#6B7280"} />
        <Text style={[styles.sortOptionText, isSelected && styles.selectedSortOptionText]}>
          {item.label}
        </Text>
        {isSelected && (
          <Text style={styles.sortDirectionText}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const filtersMaxHeight = filtersHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search prompts, categories, or tags..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor="#9CA3AF"
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setQuery('')}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#6366F1" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Search Help Button */}
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={() => setShowHelpModal(true)}
      >
        <Info size={14} color="#6B7280" />
        <Text style={styles.helpButtonText}>Search tips</Text>
      </TouchableOpacity>

      {/* Search Suggestions */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Active Filters Display */}
      {(categories.length > 0 || specialties.length > 0 || tags.length > 0) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersScroll}
          >
            {categories.map((categoryId) => (
              <TouchableOpacity 
                key={`category-${categoryId}`}
                style={styles.activeFilterChip}
                onPress={() => handleCategoryToggle(categoryId)}
              >
                <Text style={styles.activeFilterText}>
                  {CATEGORIES.find(c => c.id === categoryId)?.label || categoryId}
                </Text>
                <X size={14} color="#6366F1" />
              </TouchableOpacity>
            ))}
            
            {specialties.map((specialtyId) => (
              <TouchableOpacity 
                key={`specialty-${specialtyId}`}
                style={styles.activeFilterChip}
                onPress={() => handleSpecialtyToggle(specialtyId)}
              >
                <Text style={styles.activeFilterText}>
                  {SPECIALTIES.find(s => s.id === specialtyId)?.label || specialtyId}
                </Text>
                <X size={14} color="#6366F1" />
              </TouchableOpacity>
            ))}
            
            {tags.map((tag) => (
              <TouchableOpacity 
                key={`tag-${tag}`}
                style={styles.activeFilterChip}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.activeFilterText}>#{tag}</Text>
                <X size={14} color="#6366F1" />
              </TouchableOpacity>
            ))}
            
            {(categories.length > 0 || specialties.length > 0 || tags.length > 0) && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={handleClearSearch}
              >
                <Text style={styles.clearFiltersText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Advanced Filters */}
      <Animated.View style={[styles.filtersContainer, { maxHeight: filtersMaxHeight }]}>
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterOptionsContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterOption,
                  categories.includes(category.id) && styles.selectedFilterOption,
                  { backgroundColor: categories.includes(category.id) ? category.color : '#F3F4F6' }
                ]}
                onPress={() => handleCategoryToggle(category.id)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    categories.includes(category.id) && styles.selectedFilterOptionText,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Specialties</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterOptionsContainer}
          >
            {SPECIALTIES.slice(1).map((specialty) => (
              <TouchableOpacity
                key={specialty.id}
                style={[
                  styles.filterOption,
                  specialties.includes(specialty.id) && styles.selectedFilterOption,
                  { backgroundColor: specialties.includes(specialty.id) ? '#8B5CF6' : '#F3F4F6' }
                ]}
                onPress={() => handleSpecialtyToggle(specialty.id)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    specialties.includes(specialty.id) && styles.selectedFilterOptionText,
                  ]}
                >
                  {specialty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              style={[
                styles.addTagButton,
                !newTag.trim() && styles.addTagButtonDisabled
              ]}
              onPress={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Tag size={16} color={!newTag.trim() ? "#9CA3AF" : "#6366F1"} />
              <Text style={[
                styles.addTagButtonText,
                !newTag.trim() && styles.addTagButtonTextDisabled
              ]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Text style={styles.sortButtonText}>
              {SORT_OPTIONS.find(option => option.id === sortBy)?.label || 'Relevance'}
              {' '}
              {sortDirection === 'asc' ? '↑' : '↓'}
            </Text>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
          
          {showSortOptions && (
            <View style={styles.sortOptionsContainer}>
              <FlatList
                data={SORT_OPTIONS}
                renderItem={renderSortOption}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortOptionsList}
              />
            </View>
          )}
        </View>
      </Animated.View>

      {/* Search Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHelpModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Tips</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.helpSectionTitle}>Basic Search</Text>
              <Text style={styles.helpText}>
                Enter keywords to search across titles, content, categories, and tags.
              </Text>
              
              <Text style={styles.helpSectionTitle}>Advanced Operators</Text>
              <View style={styles.helpItem}>
                <Text style={styles.helpItemTitle}>tag:keyword</Text>
                <Text style={styles.helpItemDescription}>
                  Search for prompts with specific tags (e.g., tag:documentation)
                </Text>
              </View>
              
              <View style={styles.helpItem}>
                <Text style={styles.helpItemTitle}>category:name</Text>
                <Text style={styles.helpItemDescription}>
                  Search for prompts in a specific category (e.g., category:burnout)
                </Text>
              </View>
              
              <View style={styles.helpItem}>
                <Text style={styles.helpItemTitle}>specialty:name</Text>
                <Text style={styles.helpItemDescription}>
                  Search for prompts for a specific specialty (e.g., specialty:icu)
                </Text>
              </View>
              
              <Text style={styles.helpSectionTitle}>Combining Operators</Text>
              <Text style={styles.helpText}>
                You can combine multiple operators with regular keywords.
              </Text>
              <Text style={styles.helpExample}>
                handoff category:report tag:communication
              </Text>
              
              <Text style={styles.helpSectionTitle}>Filters</Text>
              <Text style={styles.helpText}>
                Use the filter button to access additional filtering options for categories, specialties, and tags.
              </Text>
              
              <Text style={styles.helpSectionTitle}>Sorting</Text>
              <Text style={styles.helpText}>
                Sort results by relevance, date, votes, or popularity using the Sort By option in the filters panel.
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    gap: 4,
  },
  helpButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1F2937',
  },
  activeFiltersContainer: {
    marginTop: 12,
  },
  activeFiltersLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  activeFiltersScroll: {
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filtersContainer: {
    overflow: 'hidden',
  },
  filterSection: {
    marginTop: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addTagButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addTagButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  addTagButtonTextDisabled: {
    color: '#9CA3AF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 200,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  sortOptionsContainer: {
    marginTop: 8,
  },
  sortOptionsList: {
    paddingVertical: 4,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    gap: 6,
  },
  selectedSortOption: {
    backgroundColor: '#6366F1',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedSortOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortDirectionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  helpItem: {
    marginBottom: 12,
  },
  helpItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  helpExample: {
    fontSize: 14,
    color: '#6366F1',
    backgroundColor: '#F0F4FF',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalCloseButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    margin: 16,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});