import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import { Search, Filter, X, ChevronDown } from 'lucide-react-native';
import { CATEGORIES } from '@/app/(tabs)/categories';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSpecialtyChange: (specialty: string) => void;
  selectedCategory: string;
  selectedSpecialty: string;
}

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

export function SearchBar({
  onSearch,
  onCategoryChange,
  onSpecialtyChange,
  selectedCategory,
  selectedSpecialty,
}: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (text: string) => {
    setSearchText(text);
    onSearch(text);
  };

  const handleSearchSubmit = () => {
    onSearch(searchText);
  };

  const clearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  const resetFilters = () => {
    onCategoryChange('all');
    onSpecialtyChange('all');
    setShowFilters(false);
  };

  const getSelectedCategoryLabel = () => {
    return CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'All Categories';
  };

  const getSelectedSpecialtyLabel = () => {
    return SPECIALTIES.find(spec => spec.id === selectedSpecialty)?.label || 'All Specialties';
  };

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedCategory === item.id && styles.selectedFilterOption,
      ]}
      onPress={() => onCategoryChange(item.id)}
    >
      <Text
        style={[
          styles.filterOptionText,
          selectedCategory === item.id && styles.selectedFilterOptionText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSpecialtyItem = ({ item }: { item: typeof SPECIALTIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedSpecialty === item.id && styles.selectedFilterOption,
      ]}
      onPress={() => onSpecialtyChange(item.id)}
    >
      <Text
        style={[
          styles.filterOptionText,
          selectedSpecialty === item.id && styles.selectedFilterOptionText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for any problem, keyword, or task..."
            value={searchText}
            onChangeText={handleSearch}
            onSubmitEditing={handleSearchSubmit}
            placeholderTextColor="#999999"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchSubmit}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.searchTip}>
        Tip: Search for any problem, keyword, or task—no need to pick a category.
      </Text>

      {/* Optional filters - less prominent */}
      <TouchableOpacity 
        style={styles.filtersToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={16} color="#6B7280" />
        <Text style={styles.filtersToggleText}>
          {showFilters ? 'Hide filters' : 'Optional filters'}
        </Text>
        <ChevronDown 
          size={14} 
          color="#6B7280" 
          style={[
            styles.chevron,
            showFilters && styles.chevronRotated
          ]}
        />
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Specialty</Text>
            <FlatList
              data={SPECIALTIES}
              renderItem={renderSpecialtyItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            />
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D3C98',
    color: '#FFFFFF',
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchTip: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  filtersToggleText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  filtersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  filterOptions: {
    paddingRight: 20,
  },
  filterOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedFilterOption: {
    backgroundColor: '#7D3C98',
    borderColor: '#7D3C98',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterActions: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  resetButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0072CE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0072CE',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});