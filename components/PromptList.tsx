import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Heart, Calendar, Tag, TrendingUp, Clock, User, Plus, Building2 } from 'lucide-react-native';
import { PromptWithUser } from '@/lib/fetchPrompts';
import { UserAvatar } from './UserAvatar';

interface PromptListProps {
  prompts: PromptWithUser[];
  onPromptPress: (prompt: PromptWithUser) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export function PromptList({
  prompts,
  onPromptPress,
  onRefresh,
  refreshing = false,
  loading = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  ListHeaderComponent,
  ListFooterComponent,
}: PromptListProps) {
  const numColumns = isTablet ? 2 : 1;
  const cardWidth = isTablet ? (screenWidth - 60) / 2 : screenWidth - 40;

  const renderAttribution = (item: PromptWithUser) => {
    // Built-in prompts (created_by is null)
    if (!item.created_by) {
      return (
        <View style={styles.attributionSection}>
          <View style={styles.nurseBlockAttribution}>
            <Building2 size={16} color="#7D3C98" />
            <Text style={styles.nurseBlockText}>Provided by NurseBloc</Text>
          </View>
        </View>
      );
    }

    // Anonymous prompts (created_by exists but is_anonymous is true)
    if (item.is_anonymous) {
      return (
        <View style={styles.attributionSection}>
          <View style={styles.anonymousAttribution}>
            <User size={16} color="#666666" />
            <Text style={styles.anonymousText}>Posted anonymously</Text>
          </View>
        </View>
      );
    }

    // User-attributed prompts
    if (item.user_profiles?.username) {
      return (
        <View style={styles.attributionSection}>
          <UserAvatar 
            username={item.user_profiles.username}
            size={20}
            backgroundColor="#7D3C98"
          />
          <View style={styles.userAttributionInfo}>
            <Text style={styles.userAttributionName} numberOfLines={1}>
              @{item.user_profiles.username}
            </Text>
            <Text style={styles.userAttributionSpecialty} numberOfLines={1}>
              {item.user_profiles.specialty || 'General Practice'}
            </Text>
          </View>
        </View>
      );
    }

    // Fallback for edge cases
    return (
      <View style={styles.attributionSection}>
        <View style={styles.anonymousAttribution}>
          <User size={16} color="#666666" />
          <Text style={styles.anonymousText}>Community contributor</Text>
        </View>
      </View>
    );
  };

  const renderPrompt = ({ item }: { item: PromptWithUser }) => (
    <TouchableOpacity
      style={[styles.promptCard, { width: cardWidth }]}
      onPress={() => onPromptPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.promptHeader}>
        <View style={styles.promptTitleContainer}>
          <Text style={styles.promptTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category.replace('-', ' ')}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.promptContent} numberOfLines={3}>
        {item.content}
      </Text>

      {/* Attribution Section */}
      {renderAttribution(item)}

      <View style={styles.promptMeta}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color="#666666" />
            <Text style={styles.metaText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <User size={14} color="#666666" />
            <Text style={styles.metaText}>{item.specialty?.toUpperCase() || 'GENERAL'}</Text>
          </View>
          
          <View style={styles.votesContainer}>
            <TrendingUp size={14} color="#7D3C98" />
            <Text style={styles.votesText}>{item.votes}</Text>
          </View>
        </View>
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Tag size={12} color="#666666" />
          {item.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}

      <View style={styles.difficultyContainer}>
        <Text
          style={[
            styles.difficultyBadge,
            item.difficulty_level === 'beginner' && styles.beginnerBadge,
            item.difficulty_level === 'intermediate' && styles.intermediateBadge,
            item.difficulty_level === 'advanced' && styles.advancedBadge,
          ]}
        >
          {item.difficulty_level}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLoadMoreButton = () => {
    if (!hasMore && !loadingMore) return null;

    return (
      <View style={styles.loadMoreContainer}>
        {loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#7D3C98" />
            <Text style={styles.loadingMoreText}>Loading more prompts...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={onLoadMore}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#7D3C98" />
            <Text style={styles.loadMoreText}>Load More Prompts</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.footerContainer}>
        {ListFooterComponent && (
          React.isValidElement(ListFooterComponent) ? (
            ListFooterComponent
          ) : typeof ListFooterComponent === 'function' ? (
            <ListFooterComponent />
          ) : null
        )}
        {renderLoadMoreButton()}
      </View>
    );
  };

  const renderHeader = () => {
    if (!ListHeaderComponent) return null;
    
    return React.isValidElement(ListHeaderComponent) ? (
      ListHeaderComponent
    ) : typeof ListHeaderComponent === 'function' ? (
      <ListHeaderComponent />
    ) : null;
  };

  if (loading && prompts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7D3C98" />
        <Text style={styles.loadingText}>Loading prompts...</Text>
      </View>
    );
  }

  if (prompts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Heart size={48} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>No prompts found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your search or filters, or be the first to contribute!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={prompts}
      renderItem={renderPrompt}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      key={numColumns}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={isTablet ? styles.row : undefined}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7D3C98"
            colors={['#7D3C98']}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader()}
      ListFooterComponent={renderFooter()}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#F9F9F9',
  },
  row: {
    justifyContent: 'space-between',
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  promptHeader: {
    marginBottom: 16,
  },
  promptTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  promptTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginRight: 12,
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#0072CE',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  promptContent: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  attributionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  nurseBlockAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nurseBlockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D3C98',
    fontStyle: 'italic',
  },
  anonymousAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anonymousText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    fontStyle: 'italic',
  },
  userAttributionInfo: {
    flex: 1,
    marginLeft: 8,
  },
  userAttributionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D3C98',
    marginBottom: 2,
  },
  userAttributionSpecialty: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  promptMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  votesText: {
    fontSize: 12,
    color: '#7D3C98',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    fontSize: 11,
    color: '#7D3C98',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  difficultyContainer: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: 'capitalize',
  },
  beginnerBadge: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
  },
  intermediateBadge: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
  },
  advancedBadge: {
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
    backgroundColor: '#F9F9F9',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footerContainer: {
    paddingVertical: 20,
  },
  loadMoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadMoreButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7D3C98',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    color: '#7D3C98',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  loadingMoreText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});