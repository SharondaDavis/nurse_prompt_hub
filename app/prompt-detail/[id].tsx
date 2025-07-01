import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard as Edit, History, Heart, Clock, User, Building2, MessageSquare } from 'lucide-react-native';
import { fetchPromptById, PromptWithUser } from '@/lib/fetchPrompts';
import { getPromptVersion, PromptVersionWithUser } from '@/lib/promptVersions';
import { useVoting } from '@/hooks/useVoting';
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@/hooks/useUser';
import { useComments } from '@/hooks/useComments';
import { UserAvatar } from '@/components/UserAvatar';
import { PromptEditor } from '@/components/PromptEditor';
import { VersionHistory } from '@/components/VersionHistory';

export default function PromptDetailScreen() {
  const router = useRouter();
  const { id, version } = useLocalSearchParams();
  const { user } = useUser();
  const { hasVoted, toggleVote, getVoteCount } = useVoting();
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { commentCount } = useComments(id as string);
  
  const [prompt, setPrompt] = useState<PromptWithUser | null>(null);
  const [promptVersion, setPromptVersion] = useState<PromptVersionWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteCount, setVoteCount] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (id) {
      loadPrompt();
    }
  }, [id]);

  useEffect(() => {
    if (version && id) {
      loadVersion();
    }
  }, [version, id]);

  useEffect(() => {
    if (prompt) {
      loadVoteCount();
    }
  }, [prompt]);

  const loadPrompt = async () => {
    try {
      setLoading(true);
      console.log("Loading prompt with ID:", id);
      const promptData = await fetchPromptById(id as string);
      if (promptData) {
        console.log("Prompt loaded successfully:", promptData.title);
        setPrompt(promptData);
      } else {
        console.error("Prompt not found for ID:", id);
        Alert.alert('Error', 'Prompt not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
      Alert.alert('Error', 'Failed to load prompt');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadVersion = async () => {
    if (!version) return;
    
    try {
      setLoading(true);
      const versionData = await getPromptVersion(version as string);
      if (versionData) {
        setPromptVersion(versionData);
      }
    } catch (error) {
      console.error('Error loading version:', error);
      Alert.alert('Error', 'Failed to load prompt version');
    } finally {
      setLoading(false);
    }
  };

  const loadVoteCount = async () => {
    if (!prompt) return;
    
    try {
      const count = await getVoteCount(prompt.id);
      setVoteCount(count);
    } catch (error) {
      console.error('Error loading vote count:', error);
    }
  };

  const handleVoteToggle = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to be signed in to vote on prompts.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!prompt || isVoting) return;

    try {
      setIsVoting(true);
      const wasVoted = hasVoted(prompt.id);
      
      // Optimistic update
      setVoteCount(prev => wasVoted ? Math.max(0, prev - 1) : prev + 1);
      
      await toggleVote(prompt.id);
      
      // Refresh vote count from server
      await loadVoteCount();
    } catch (error) {
      console.error('Error toggling vote:', error);
      
      // Revert optimistic update on error
      const wasVoted = hasVoted(prompt.id);
      setVoteCount(prev => wasVoted ? prev + 1 : Math.max(0, prev - 1));
      
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update vote. Please try again.'
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to be signed in to save prompts to favorites.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!prompt || isFavoriting) return;

    try {
      setIsFavoriting(true);
      
      if (isFavorited(prompt.id)) {
        await removeFavorite(prompt.id);
        Alert.alert('Removed', 'Prompt removed from favorites.');
      } else {
        await addFavorite(prompt.id);
        Alert.alert('Saved!', 'Prompt added to your favorites.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleEditPrompt = () => {
    if (!prompt) return;
    setShowEditor(true);
  };

  const handleViewVersionHistory = () => {
    if (!prompt) return;
    setShowVersionHistory(true);
  };

  const handleViewVersion = async (versionId: string) => {
    try {
      const version = await getPromptVersion(versionId);
      if (version) {
        setPromptVersion(version);
        setShowVersionHistory(false);
      }
    } catch (error) {
      console.error('Error loading version:', error);
      Alert.alert('Error', 'Failed to load version');
    }
  };

  const handleEditVersion = (versionId: string) => {
    // This would be similar to handleEditPrompt but for a specific version
    console.log('Edit version:', versionId);
  };

  const handleSaveVersion = (versionId: string) => {
    setShowEditor(false);
    loadPrompt(); // Refresh the prompt data
  };

  const renderAttribution = () => {
    // If we're viewing a version
    if (promptVersion) {
      return (
        <View style={styles.attributionSection}>
          <View style={styles.versionBadge}>
            <History size={16} color="#6366F1" />
            <Text style={styles.versionBadgeText}>
              Version {promptVersion.version_number}
            </Text>
          </View>
          
          <UserAvatar 
            username={promptVersion.username || 'user'}
            size={40}
            backgroundColor="#6366F1"
          />
          
          <View style={styles.userAttributionInfo}>
            <Text style={styles.userAttributionName}>
              @{promptVersion.username || 'anonymous'}
            </Text>
            <Text style={styles.userAttributionSpecialty}>
              {promptVersion.user_specialty || 'General Practice'}
            </Text>
          </View>
        </View>
      );
    }

    // For the original prompt
    if (!prompt) return null;

    // Built-in prompts (created_by is null)
    if (!prompt.created_by) {
      return (
        <View style={styles.attributionSection}>
          <View style={styles.nurseBlockAttribution}>
            <Building2 size={20} color="#7D3C98" />
            <Text style={styles.nurseBlockText}>Provided by NurseBloc</Text>
          </View>
        </View>
      );
    }

    // Anonymous prompts (created_by exists but is_anonymous is true)
    if (prompt.is_anonymous) {
      return (
        <View style={styles.attributionSection}>
          <View style={styles.anonymousAttribution}>
            <User size={20} color="#666666" />
            <Text style={styles.anonymousText}>Posted anonymously</Text>
          </View>
        </View>
      );
    }

    // User-attributed prompts
    if (prompt.user_profiles?.username) {
      return (
        <View style={styles.attributionSection}>
          <UserAvatar 
            username={prompt.user_profiles.username}
            size={48}
            backgroundColor="#7D3C98"
          />
          <View style={styles.userAttributionInfo}>
            <Text style={styles.userAttributionName}>
              @{prompt.user_profiles.username}
            </Text>
            <Text style={styles.userAttributionSpecialty}>
              {prompt.user_profiles.specialty || 'General Practice'}
            </Text>
          </View>
        </View>
      );
    }

    // Fallback for edge cases
    return (
      <View style={styles.attributionSection}>
        <View style={styles.anonymousAttribution}>
          <User size={20} color="#666666" />
          <Text style={styles.anonymousText}>Community contributor</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading prompt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prompt && !promptVersion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prompt Not Found</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Prompt not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayPrompt = promptVersion || prompt;
  if (!displayPrompt) return null;

  const userHasVoted = prompt ? hasVoted(prompt.id) : false;
  const userHasFavorited = prompt ? isFavorited(prompt.id) : false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#666666" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {promptVersion ? 'Version Details' : 'Prompt Details'}
        </Text>
        
        <View style={styles.headerActions}>
          {prompt && prompt.has_versions && (
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={handleViewVersionHistory}
            >
              <History size={20} color="#6366F1" />
            </TouchableOpacity>
          )}
          
          {user && !promptVersion && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditPrompt}
            >
              <Edit size={20} color="#6366F1" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{displayPrompt.title}</Text>
        
        {/* Author Section */}
        {renderAttribution()}
        
        <View style={styles.metaSection}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>{displayPrompt.category}</Text>
          </View>
          {displayPrompt.specialty && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{displayPrompt.specialty}</Text>
            </View>
          )}
        </View>

        <Text style={styles.promptContent}>{displayPrompt.content}</Text>

        {/* Tags Section */}
        {displayPrompt.tags && displayPrompt.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {displayPrompt.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Change Summary for Versions */}
        {promptVersion && promptVersion.change_summary && (
          <View style={styles.changeSummarySection}>
            <Text style={styles.changeSummaryTitle}>Changes from original:</Text>
            <Text style={styles.changeSummaryText}>{promptVersion.change_summary}</Text>
          </View>
        )}

        {/* Vote Section - only for original prompts */}
        {prompt && !promptVersion && (
          <View style={styles.voteSection}>
            <TouchableOpacity
              style={[
                styles.voteButton,
                userHasVoted && styles.voteButtonActive,
                isVoting && styles.voteButtonDisabled
              ]}
              onPress={handleVoteToggle}
              disabled={isVoting}
              activeOpacity={0.7}
            >
              <Heart 
                size={20} 
                color={userHasVoted ? "#FFFFFF" : "#7D3C98"}
                fill={userHasVoted ? "#FFFFFF" : "none"}
              />
              <Text style={[
                styles.voteButtonText,
                userHasVoted && styles.voteButtonTextActive
              ]}>
                {isVoting ? 'Updating...' : `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Created {new Date(displayPrompt.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      {/* Action Bar - only for original prompts */}
      {prompt && !promptVersion && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              userHasFavorited && styles.favoriteButtonActive,
              isFavoriting && styles.favoriteButtonDisabled
            ]}
            onPress={handleFavoriteToggle}
            disabled={isFavoriting}
            activeOpacity={0.8}
          >
            <Heart 
              size={20} 
              color={userHasFavorited ? "#FFFFFF" : "#EF4444"}
              fill={userHasFavorited ? "#FFFFFF" : "none"}
            />
            <Text style={[
              styles.favoriteButtonText,
              userHasFavorited && styles.favoriteButtonTextActive
            ]}>
              {isFavoriting ? 'Updating...' : (userHasFavorited ? 'Saved' : 'Save')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => setShowComments(!showComments)}
            activeOpacity={0.8}
          >
            <MessageSquare size={20} color="#6366F1" />
            <Text style={styles.commentButtonText}>
              {showComments ? 'Hide Comments' : 'View Comments'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Version History Modal */}
      {prompt && (
        <Modal
          visible={showVersionHistory}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowVersionHistory(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <VersionHistory
              promptId={prompt.id}
              onViewVersion={handleViewVersion}
              onEditVersion={handleEditVersion}
            />
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowVersionHistory(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      )}
      
      {/* Prompt Editor Modal */}
      {prompt && (
        <Modal
          visible={showEditor}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowEditor(false)}
        >
          <PromptEditor
            originalPrompt={prompt}
            onClose={() => setShowEditor(false)}
            onSave={handleSaveVersion}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  historyButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 16,
  },
  attributionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
    gap: 6,
  },
  versionBadgeText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  nurseBlockAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nurseBlockText: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    fontStyle: 'italic',
  },
  userAttributionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userAttributionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7D3C98',
    marginBottom: 4,
  },
  userAttributionSpecialty: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  metaBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  metaBadgeText: {
    fontSize: 12,
    color: '#0072CE',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  promptContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  changeSummarySection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  changeSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  changeSummaryText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  voteSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#7D3C98',
    gap: 8,
  },
  voteButtonActive: {
    backgroundColor: '#7D3C98',
    borderColor: '#7D3C98',
  },
  voteButtonDisabled: {
    opacity: 0.6,
  },
  voteButtonText: {
    fontSize: 16,
    color: '#7D3C98',
    fontWeight: '600',
  },
  voteButtonTextActive: {
    color: '#FFFFFF',
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  favoriteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  favoriteButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  favoriteButtonDisabled: {
    opacity: 0.6,
  },
  favoriteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  favoriteButtonTextActive: {
    color: '#FFFFFF',
  },
  commentButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  commentButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  closeModalButton: {
    margin: 16,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});