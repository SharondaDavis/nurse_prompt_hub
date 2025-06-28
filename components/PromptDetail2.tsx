import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import { 
  X, 
  Copy, 
  Heart, 
  Bell, 
  Share2,
  Clock,
  User,
  Tag,
  TrendingUp,
  CheckCircle
} from 'lucide-react-native';
import { useFavorites } from '../hooks/useFavorites';

interface PromptDetail2Props {
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    votes: number;
    author?: {
      name: string;
      specialty: string;
    };
    createdAt: string;
  };
  onClose: () => void;
  isAuthenticated?: boolean;
  onSignInRequired?: () => void;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PromptDetail2({ 
  prompt, 
  onClose, 
  isAuthenticated = false,
  onSignInRequired 
}: PromptDetail2Props) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [isCopied, setIsCopied] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  
  const isFavorited = favorites.some(fav => fav.id === prompt.id);

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(prompt.content);
      setIsCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
      
      Alert.alert('Copied!', 'Prompt content has been copied to your clipboard.');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy content to clipboard.');
    }
  };

  const handleSetReminder = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Reminders Not Available',
        'Notifications are not supported on web. Please use the mobile app to set reminders.'
      );
      return;
    }

    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders.'
        );
        return;
      }

      // Schedule a notification for 1 hour from now
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nursing Prompt Reminder',
          body: `Time to review: ${prompt.title}`,
          data: { promptId: prompt.id },
          sound: 'default',
        },
        trigger: {
          seconds: 3600, // 1 hour
        },
      });

      setReminderSet(true);
      Alert.alert(
        'Reminder Set! 🔔',
        'You\'ll receive a notification in 1 hour to review this prompt.',
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

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      onSignInRequired?.();
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(prompt.id);
        Alert.alert('Removed', 'Prompt removed from favorites.');
      } else {
        await addFavorite(prompt.id);
        Alert.alert('Saved!', 'Prompt added to your favorites.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Check out this nursing prompt: ${prompt.title}\n\n${prompt.content}`,
        title: prompt.title,
      };

      if (Platform.OS === 'web') {
        // Web fallback - copy to clipboard
        await Clipboard.setStringAsync(shareContent.message);
        Alert.alert('Copied!', 'Prompt content has been copied to your clipboard for sharing.');
      } else {
        await Share.share(shareContent);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share prompt.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { backgroundColor: '#DCFCE7', color: '#166534' };
      case 'intermediate':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'advanced':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  const renderPlaceholderContent = (content: string) => {
    // Replace common placeholders with styled versions
    const placeholderRegex = /\[(.*?)\]/g;
    const parts = content.split(placeholderRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a placeholder
        return (
          <Text key={index} style={styles.placeholder}>
            [{part}]
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Prompt Details</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title and Meta */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{prompt.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{prompt.category}</Text>
            </View>
            
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(prompt.difficulty).backgroundColor }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: getDifficultyColor(prompt.difficulty).color }
              ]}>
                {prompt.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* Author Info */}
        {prompt.author && (
          <View style={styles.authorSection}>
            <View style={styles.authorAvatar}>
              <User size={20} color="#6366F1" />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{prompt.author.name}</Text>
              <Text style={styles.authorSpecialty}>{prompt.author.specialty}</Text>
            </View>
            <View style={styles.promptStats}>
              <TrendingUp size={16} color="#EF4444" />
              <Text style={styles.votesText}>{prompt.votes} votes</Text>
            </View>
          </View>
        )}

        {/* Prompt Content */}
        <View style={styles.promptSection}>
          <Text style={styles.sectionTitle}>Prompt Content</Text>
          <View style={styles.promptContent}>
            <Text style={styles.promptText}>
              {renderPlaceholderContent(prompt.content)}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {prompt.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Tag size={12} color="#6366F1" />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Created Date */}
        <View style={styles.dateSection}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            Created {new Date(prompt.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCopyToClipboard}
          activeOpacity={0.8}
        >
          {isCopied ? (
            <CheckCircle size={20} color="#10B981" />
          ) : (
            <Copy size={20} color="#6B7280" />
          )}
          <Text style={[
            styles.actionButtonText,
            isCopied && styles.actionButtonTextSuccess
          ]}>
            {isCopied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            reminderSet && styles.actionButtonActive
          ]}
          onPress={handleSetReminder}
          activeOpacity={0.8}
        >
          <Bell size={20} color={reminderSet ? "#6366F1" : "#6B7280"} />
          <Text style={[
            styles.actionButtonText,
            reminderSet && styles.actionButtonTextActive
          ]}>
            {reminderSet ? 'Reminder Set' : 'Remind Me'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Share2 size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.favoriteButton,
            isFavorited && styles.favoriteButtonActive
          ]}
          onPress={handleToggleFavorite}
          activeOpacity={0.8}
        >
          <Heart 
            size={20} 
            color={isFavorited ? "#FFFFFF" : "#EF4444"}
            fill={isFavorited ? "#FFFFFF" : "none"}
          />
          <Text style={[
            styles.favoriteButtonText,
            isFavorited && styles.favoriteButtonTextActive
          ]}>
            {isFavorited ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  authorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  promptStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  votesText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  promptSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  promptContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  promptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  placeholder: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 20,
  },
  dateText: {
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
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: '#F0F4FF',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionButtonTextSuccess: {
    color: '#10B981',
  },
  actionButtonTextActive: {
    color: '#6366F1',
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
  favoriteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  favoriteButtonTextActive: {
    color: '#FFFFFF',
  },
});