import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Search, ChevronDown, X, Stethoscope } from 'lucide-react-native';
import { CATEGORIES } from '@/app/(tabs)/categories';

interface EnhancedHeaderProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
  searchQuery?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export function EnhancedHeader({
  onSearch,
  onCategoryChange,
  selectedCategory,
  searchQuery = '',
}: EnhancedHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchText, setSearchText] = useState(searchQuery);
  const [searchAnimation] = useState(new Animated.Value(0));

  const expandSearch = () => {
    setIsSearchExpanded(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const collapseSearch = () => {
    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchExpanded(false);
    });
  };

  const handleSearchSubmit = () => {
    onSearch(searchText);
    collapseSearch();
  };

  const handleSearchCancel = () => {
    setSearchText('');
    onSearch('');
    collapseSearch();
  };

  const getSelectedCategoryLabel = () => {
    return CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'All Categories';
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setShowCategoryDropdown(false);
  };

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedCategory === item.id && styles.selectedDropdownItem,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text
        style={[
          styles.dropdownItemText,
          selectedCategory === item.id && styles.selectedDropdownItemText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const searchInputWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth - 120],
  });

  const titleOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const searchOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo and Title */}
          <Animated.View style={[styles.logoSection, { opacity: titleOpacity }]}>
            <View style={styles.logoContainer}>
              <Stethoscope size={28} color="#7D3C98" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Nurse Prompt Hub</Text>
              <Text style={styles.subtitle}>Real Prompts for Real Nurses</Text>
            </View>
          </Animated.View>

          {/* Search Input (Expanded) */}
          {isSearchExpanded && (
            <Animated.View 
              style={[
                styles.expandedSearchContainer,
                { 
                  width: searchInputWidth,
                  opacity: searchOpacity,
                }
              ]}
            >
              <Search size={20} color="#666666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search nursing prompts..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                placeholderTextColor="#999999"
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity onPress={handleSearchCancel} style={styles.cancelButton}>
                <X size={18} color="#666666" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isSearchExpanded && (
              <>
                {/* Category Dropdown */}
                <TouchableOpacity
                  style={styles.categoryButton}
                  onPress={() => setShowCategoryDropdown(true)}
                >
                  <Text style={styles.categoryButtonText} numberOfLines={1}>
                    {getSelectedCategoryLabel()}
                  </Text>
                  <ChevronDown size={16} color="#666666" />
                </TouchableOpacity>

                {/* Search Icon */}
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={expandSearch}
                >
                  <Search size={20} color="#7D3C98" />
                </TouchableOpacity>
              </>
            )}

            {isSearchExpanded && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSearchSubmit}
              >
                <Text style={styles.submitButtonText}>Search</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  expandedSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  cancelButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    maxWidth: 140,
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#7D3C98',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D3C98',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  selectedDropdownItem: {
    backgroundColor: '#F3E8FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  selectedDropdownItemText: {
    color: '#7D3C98',
    fontWeight: '600',
  },
});