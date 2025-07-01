import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Platform } from 'react-native';
import { Clock, User, CircleCheck as CheckCircle, CreditCard as Edit, Eye, ChevronRight, History, FileText } from 'lucide-react-native';
import { getPromptVersions, PromptVersionWithUser, publishPromptVersion } from '@/lib/promptVersions';
import { useUser } from '@/hooks/useUser';

interface VersionHistoryProps {
  promptId: string;
  onViewVersion: (versionId: string) => void;
  onEditVersion: (versionId: string) => void;
}

export function VersionHistory({ promptId, onViewVersion, onEditVersion }: VersionHistoryProps) {
  const { user } = useUser();
  const [versions, setVersions] = useState<PromptVersionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingVersionId, setPublishingVersionId] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, [promptId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const versionData = await getPromptVersions(promptId);
      setVersions(versionData);
    } catch (err) {
      console.error('Error loading versions:', err);
      setError('Failed to load version history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishVersion = async (versionId: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to publish versions.');
      return;
    }
    
    try {
      setPublishingVersionId(versionId);
      
      await publishPromptVersion(versionId);
      
      // Update the local state to reflect the change
      setVersions(prevVersions => 
        prevVersions.map(version => 
          version.id === versionId 
            ? { ...version, is_published: true } 
            : version
        )
      );
      
      Alert.alert('Success', 'Version published successfully!');
    } catch (err) {
      console.error('Error publishing version:', err);
      Alert.alert('Error', 'Failed to publish version. Please try again.');
    } finally {
      setPublishingVersionId(null);
    }
  };

  const renderVersionItem = ({ item }: { item: PromptVersionWithUser }) => {
    const isCurrentUserVersion = user && item.created_by === user.id;
    const isPublishing = publishingVersionId === item.id;
    
    return (
      <TouchableOpacity 
        style={styles.versionItem}
        onPress={() => onViewVersion(item.id)}
        disabled={isPublishing}
      >
        <View style={styles.versionHeader}>
          <View style={styles.versionInfo}>
            <Text style={styles.versionNumber}>Version {item.version_number}</Text>
            {item.is_published && (
              <View style={styles.publishedBadge}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.publishedText}>Published</Text>
              </View>
            )}
          </View>
          
          <View style={styles.versionDate}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.versionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.versionAuthor}>
          <User size={14} color="#6B7280" />
          <Text style={styles.authorText}>
            {item.username || 'Anonymous'}
          </Text>
        </View>
        
        {item.change_summary && (
          <View style={styles.changeSummary}>
            <Text style={styles.changeSummaryLabel}>Changes:</Text>
            <Text style={styles.changeSummaryText} numberOfLines={2}>
              {item.change_summary}
            </Text>
          </View>
        )}
        
        <View style={styles.versionActions}>
          {isCurrentUserVersion && !item.is_published && (
            <TouchableOpacity 
              style={styles.publishButton}
              onPress={() => handlePublishVersion(item.id)}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <>
                  <CheckCircle size={14} color="#6366F1" />
                  <Text style={styles.publishButtonText}>Publish</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => onViewVersion(item.id)}
          >
            <Eye size={14} color="#6B7280" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          {isCurrentUserVersion && !item.is_published && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => onEditVersion(item.id)}
            >
              <Edit size={14} color="#6366F1" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          <ChevronRight size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading version history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVersions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (versions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <History size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No versions yet</Text>
        <Text style={styles.emptyText}>
          This prompt doesn't have any edited versions yet.
          Be the first to create an improved version!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <FileText size={20} color="#1F2937" />
          <Text style={styles.headerTitle}>Version History</Text>
        </View>
        <Text style={styles.versionCount}>{versions.length} version{versions.length !== 1 ? 's' : ''}</Text>
      </View>
      
      <FlatList
        data={versions}
        renderItem={renderVersionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  versionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  versionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  publishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  publishedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  versionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  versionAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  authorText: {
    fontSize: 14,
    color: '#6B7280',
  },
  changeSummary: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  changeSummaryText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  versionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  publishButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#6366F1',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
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
});