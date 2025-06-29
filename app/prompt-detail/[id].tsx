import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  X, 
  ThumbsUp, 
  Share2, 
  Copy, 
  Heart,
  Clock,
  User,
  Building2,
  Bell,
  ArrowLeft,
  MessageSquare
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { fetchPromptById, PromptWithUser } from '@/lib/fetchPrompts';
import { useVoting } from '@/hooks/useVoting';
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@/hooks/useUser';
import { useComments } from '@/hooks/useComments';
import { UserAvatar } from '@/components/UserAvatar';
import { Auth } from '@/components/Auth';
import { CommentSection } from '@/components/CommentSection';

export default function PromptDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const { hasVoted, toggleVote, getVoteCount } = useVoting();
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { commentCount } = useComments(id as string);
  
  const [prompt, setPrompt] = useState<PromptWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteCount, setVoteCount] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (id) {
      loadPrompt();
    }
  }, [id]);

  useEffect(() => {
    if (prompt) {
      loadVoteCount();
    }
  }, [prompt]);

  const loadPrompt = async () => {
    try {
      setLoading(true);
      const promptData = await fetchPromptById(id as string);
      if (promptData) {
        setPrompt(promptData);
      } else {
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
      setShowAuth(true);
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
      setShowAuth(true);
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

  const handleCopyToClipboard = async () => {
    if (!prompt) return;
    
    try {
      await Clipboard.setStringAsync(prompt.content);
      Alert.alert('Copied!', 'Prompt content has been copied to your clipboard.');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy content to clipboard.');
    }
  };

  const handleShare = async () => {
    if (!prompt) return;
    
    try {
      await Share.share({
        message: `Check out this nursing prompt: ${prompt.title}\n\n${prompt.content}`,
        title: prompt.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share prompt.');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const renderAttribution = () => {
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
            <Text style={styles.userAttributionFullName}>
              {prompt.user_profiles.full_name || 'Anonymous Nurse'}
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
          <Text style={styles.loadingText}>Loading prompt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prompt) {
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

  const userHasVoted = hasVoted(prompt.id);
  const userHasFavorited = isFavorited(prompt.id);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prompt Details</Text>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{prompt.title}</Text>
          
          {/* Author Section */}
          {renderAttribution()}
          
          <View style={styles.metaSection}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{prompt.category}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{prompt.specialty}</Text>
            </View>
          </View>

          <Text style={styles.promptContent}>{prompt.content}</Text>

          {prompt.tags && prompt.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {prompt.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Vote Section */}
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
              <ThumbsUp 
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

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCopyToClipboard}
              activeOpacity={0.7}
            >
              <Copy size={18} color="#666666" />
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={18} color="#666666" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleComments}
              activeOpacity={0.7}
            >
              <MessageSquare size={18} color="#666666" />
              <Text style={styles.actionButtonText}>
                Comments ({commentCount})
              </Text>
            </TouchableOpacity>
          </View>

          {showComments && (
            <CommentSection 
              promptId={prompt.id} 
              onSignInRequired={() => setShowAuth(true)}
            />
          )}

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Created {new Date(prompt.created_at).toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>

        {/* Action Bar */}
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
            onPress={handleToggleComments}
            activeOpacity={0.8}
          >
            <MessageSquare size={20} color="#6366F1" />
            <Text style={styles.commentButtonText}>
              {showComments ? 'Hide Comments' : 'View Comments'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Modal */}
        <Modal
          visible={showAuth}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <Auth
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 36,
    marginBottom: 20,
  },
  attributionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#7D3C98',
    marginBottom: 4,
  },
  userAttributionSpecialty: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  userAttributionFullName: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  tagsTitle: {
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
    fontSize: 14,
    color: '#7D3C98',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
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
    paddingHorizontal: 20,
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
});