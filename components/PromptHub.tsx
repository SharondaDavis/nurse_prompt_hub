import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { 
  Search, 
  Filter, 
  Tag, 
  Heart, 
  Clock, 
  Edit, 
  Copy, 
  History,
  Plus,
  ChevronRight,
  TrendingUp,
  Sparkles,
  FileText,
  User
} from 'lucide-react-native';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { PromptEditor } from './PromptEditor';
import { VersionHistory } from './VersionHistory';
import { PromptWithUser } from '@/lib/fetchPrompts';
import { advancedSearch, SearchOptions, SearchResult } from '@/lib/advancedSearch';
import { getPromptVersion, PromptVersionWithUser } from '@/lib/promptVersions';
import { useUser } from '@/hooks/useUser';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface PromptHubProps {
  initialPrompts?: PromptWithUser[];
  onPromptPress: (promptId: string) => void;
  onVersionPress?: (versionId: string) => void;
}

export function PromptHub({ initialPrompts = [], onPromptPress, onVersionPress }: PromptHubProps) {
  const { user } = useUser();
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: '',
    categories: [],
    specialties: [],
    tags: [],
    sortBy: 'relevance',
    sortDirection: 'desc',
    limit: 20,
    offset: 0,
  });
  
  const [searchResults, setSearchResults] = useState<SearchResult>({
    prompts: initialPrompts,
    total: initialPrompts.length,
    hasMore: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showEditor, setShowEditor] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithUser | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersionWithUser | null>(null);

  useEffect(() => {
    if (initialPrompts.length === 0) {
      performSearch();
    }
  }, []);

  const performSearch = async (options?: Partial<SearchOptions>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedOptions = { ...searchOptions, ...options, offset: 0 };
      setSearchOptions(updatedOptions);
      
      const results = await advancedSearch(updatedOptions);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const updatedOptions = { ...searchOptions, offset: 0 };
      
      const results = await advancedSearch(updatedOptions);
      setSearchResults(results);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh results. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !searchResults.hasMore) return;
    
    try {
      setLoadingMore(true);
      
      const updatedOptions = {
        ...searchOptions,
        offset: searchResults.prompts.length,
      };
      
      const results = await advancedSearch(updatedOptions);
      
      setSearchResults({
        prompts: [...searchResults.prompts, ...results.prompts],
        total: results.total,
        hasMore: results.hasMore,
      });
    } catch (err) {
      console.error('Load more error:', err);
      // Don't set error state to avoid disrupting the UI
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (options: {
    query: string;
    categories: string[];
    specialties: string[];
    tags: string[];
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }) => {
    performSearch({
      query: options.query,
      categories: options.categories,
      specialties: options.specialties,
      tags: options.tags,
      sortBy: options.sortBy as 'relevance' | 'date' | 'votes' | 'popularity',
      sortDirection: options.sortDirection,
    });
  };

  const handleEditPrompt = (prompt: PromptWithUser) => {
    setSelectedPrompt(prompt);
    setShowEditor(true);
  };

  const handleViewVersionHistory = (prompt: PromptWithUser) => {
    setSelectedPrompt(prompt);
    setShowVersionHistory(true);
  };

  const handleViewVersion = async (versionId: string) => {
    try {
      const version = await getPromptVersion(versionId);
      if (version) {
        setSelectedVersion(version);
        if (onVersionPress) {
          onVersionPress(versionId);
        }
      }
    } catch (err) {
      console.error('Error loading version:', err);
    }
  };

  const handleEditVersion = (versionId: string) => {
    // This would be similar to handleEditPrompt but for a specific version
    console.log('Edit version:', versionId);
  };

  const handleSaveVersion = (versionId: string) => {
    setShowEditor(false);
    handleRefresh();
  };

  const renderPromptItem = ({ item, index }: { item: PromptWithUser; index: number }) => {
    const hasVersions = item.has_versions;
    
    return (
      <View style={[
        styles.promptContainer,
        isTablet && (index % 2 === 0 ? styles.promptLeft : styles.promptRight)
      ]}>
        <TouchableOpacity
          style={styles.promptCard}
          onPress={() => onPromptPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.promptHeader}>
            <View style={styles.promptCategory}>
              <Text style={styles.promptCategoryText}>{item.category}</Text>
            </View>
            
            {hasVersions && (
              <TouchableOpacity 
                style={styles.versionsButton}
                onPress={() => handleViewVersionHistory(item)}
              >
                <History size={14} color="#6366F1" />
                <Text style={styles.versionsButtonText}>Versions</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.promptTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={styles.promptExcerpt} numberOfLines={3}>
            {item.content.substring(0, 150)}...
          </Text>
          
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
              )}
            </View>
          )}
          
          <View style={styles.promptFooter}>
            <View style={styles.promptStats}>
              <View style={styles.statItem}>
                <Heart size={14} color="#EF4444" />
                <Text style={styles.statText}>{item.votes_count || item.votes || 0}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.statText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.promptActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditPrompt(item)}
              >
                <Edit size={14} color="#6366F1" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onPromptPress(item.id)}
              >
                <ChevronRight size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <AdvancedSearchBar
        onSearch={handleSearch}
        initialQuery={searchOptions.query}
        initialCategories={searchOptions.categories}
        initialSpecialties={searchOptions.specialties}
        initialTags={searchOptions.tags}
        initialSortBy={searchOptions.sortBy}
        initialSortDirection={searchOptions.sortDirection}
      />
    </View>
  );

  const renderFooter = () => {
    if (!searchResults.hasMore) return null;
    
    return (
      <View style={styles.footer}>
        {loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={styles.loadingMoreText}>Loading more prompts...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Plus size={16} color="#6366F1" />
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Searching prompts...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => performSearch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Search size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No prompts found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your search terms or filters to find what you're looking for.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={searchResults.prompts}
        renderItem={renderPromptItem}
        keyExtractor={(item) => item.id}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'two-columns' : 'one-column'}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      
      {/* Prompt Editor Modal */}
      {selectedPrompt && (
        <Modal
          visible={showEditor}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowEditor(false)}
        >
          <PromptEditor
            originalPrompt={selectedPrompt}
            onClose={() => setShowEditor(false)}
            onSave={handleSaveVersion}
          />
        </Modal>
      )}
      
      {/* Version History Modal */}
      {selectedPrompt && (
        <Modal
          visible={showVersionHistory}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowVersionHistory(false)}
        >
          <View style={styles.versionHistoryContainer}>
            <View style={styles.versionHistoryHeader}>
              <Text style={styles.versionHistoryTitle}>Version History</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowVersionHistory(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.originalPromptInfo}>
              <Text style={styles.originalPromptTitle}>Original Prompt:</Text>
              <Text style={styles.originalPromptName} numberOfLines={1}>
                {selectedPrompt.title}
              </Text>
              <View style={styles.originalPromptMeta}>
                <User size={14} color="#6B7280" />
                <Text style={styles.originalPromptAuthor}>
                  {selectedPrompt.user_profiles?.username || 'Anonymous'}
                </Text>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.originalPromptDate}>
                  {new Date(selectedPrompt.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <VersionHistory
              promptId={selectedPrompt.id}
              onViewVersion={handleViewVersion}
              onEditVersion={handleEditVersion}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  promptContainer: {
    marginBottom: 16,
    width: isTablet ? '50%' : '100%',
    paddingHorizontal: isTablet ? 8 : 0,
  },
  promptLeft: {
    paddingRight: 8,
  },
  promptRight: {
    paddingLeft: 8,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptCategory: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  promptCategoryText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  versionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  versionsButtonText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
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
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6366F1',
  },
  moreTags: {
    fontSize: 12,
    color: '#6B7280',
    paddingHorizontal: 4,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  promptStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  promptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
  versionHistoryContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  versionHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  versionHistoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  originalPromptInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  originalPromptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  originalPromptName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  originalPromptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPromptAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  originalPromptDate: {
    fontSize: 14,
    color: '#6B7280',
  },
});