import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { X, Bell, ThumbsUp, Share2, Copy } from 'lucide-react-native';
import { PromptWithUser } from '@/lib/fetchPrompts';
import { UserAvatar } from './UserAvatar';
import { ReminderButton } from './ReminderButton';
import { useVoting } from '@/hooks/useVoting';
import { useUser } from '@/hooks/useUser';
import * as Clipboard from 'expo-clipboard';

interface PromptDetailProps {
  prompt: PromptWithUser;
  onClose: () => void;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function PromptDetail({ prompt, onClose }: PromptDetailProps) {
  const { user } = useUser();
  const { hasVoted, toggleVote, getVoteCount } = useVoting();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [voteCount, setVoteCount] = useState(prompt.votes_count || prompt.votes || 0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermissions();
    }
    
    // Load current vote count
    loadVoteCount();
  }, []);

  const loadVoteCount = async () => {
    try {
      const count = await getVoteCount(prompt.id);
      setVoteCount(count);
    } catch (error) {
      console.error('Error loading vote count:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setPermissionStatus('denied');
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

    if (isVoting) return;

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

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(prompt.content);
      Alert.alert('Copied!', 'Prompt content has been copied to your clipboard.');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy content to clipboard.');
    }
  };

  const isHydrationPrompt = (): boolean => {
    const hydrationKeywords = ['hydration', 'water', 'bio-break', 'break', 'drink'];
    const titleLower = prompt.title.toLowerCase();
    const contentLower = prompt.content.toLowerCase();
    
    return hydrationKeywords.some(keyword => 
      titleLower.includes(keyword) || contentLower.includes(keyword)
    ) || prompt.category === 'Self-Care';
  };

  const scheduleHydrationReminder = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Notifications Not Available',
        'Notifications are not supported on web. Please use the mobile app to set reminders.'
      );
      return;
    }

    if (permissionStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive reminders.'
      );
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hydration & Bio-Break Check',
          body: 'Time to hydrate: 8 oz water + quick restroom break if safe',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: 4 * 60 * 60, // 4 hours
        },
      });

      Alert.alert(
        'Reminder Set! 🔔',
        'You\'ll receive a hydration reminder in 4 hours.',
        [{ text: 'OK' }]
      );

      console.log('Notification scheduled:', notificationId);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert(
        'Error',
        'Failed to schedule reminder. Please try again.'
      );
    }
  };

  const renderAttribution = () => {
    // Built-in prompts (created_by is null)
    if (!prompt.created_by) {
      return (
        <View style={styles.attributionSection}>
          <View style={styles.nurseBlockAttribution}>
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
            size={40}
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
          <Text style={styles.anonymousText}>Community contributor</Text>
        </View>
      </View>
    );
  };

  const userHasVoted = hasVoted(prompt.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prompt Details</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#666666" />
        </TouchableOpacity>
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
            <Text style={styles.actionButtonText}>Copy Content</Text>
          </TouchableOpacity>
        </View>

        {/* Hydration Reminder Button */}
        {isHydrationPrompt() && (
          <View style={styles.reminderSection}>
            <Text style={styles.reminderSectionTitle}>Set up notifications</Text>
            <Text style={styles.reminderSectionDescription}>
              Get reminders on your phone or Apple Watch for this prompt
            </Text>
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={scheduleHydrationReminder}
              activeOpacity={0.7}
            >
              <Bell size={16} color="#14B8A6" />
              <Text style={styles.reminderButtonText}>🔔 Set Reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Created {new Date(prompt.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
    lineHeight: 32,
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
    borderColor: '#E5E5E5',
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
    marginBottom: 2,
  },
  userAttributionFullName: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metaBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  metaBadgeText: {
    fontSize: 12,
    color: '#0072CE',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  promptContent: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 14,
    color: '#7D3C98',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
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
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  reminderSection: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  reminderSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  reminderSectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  reminderButtonText: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
});