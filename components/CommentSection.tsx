import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MessageSquare, Send, MoveVertical as MoreVertical, CreditCard as Edit, Trash, Clock } from 'lucide-react-native';
import { useComments, Comment } from '@/hooks/useComments';
import { useUser } from '@/hooks/useUser';
import { UserAvatar } from './UserAvatar';

interface CommentSectionProps {
  promptId: string;
  onSignInRequired?: () => void;
}

export function CommentSection({ promptId, onSignInRequired }: CommentSectionProps) {
  const { user } = useUser();
  const { 
    comments, 
    loading, 
    addComment, 
    updateComment, 
    deleteComment, 
    isUserComment 
  } = useComments(promptId);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  const handleSubmitComment = async () => {
    if (!user) {
      onSignInRequired?.();
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add comment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setExpandedMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateComment(editingCommentId, editingContent);
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update comment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);
              setExpandedMenuId(null);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete comment. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const toggleMenu = (commentId: string) => {
    setExpandedMenuId(expandedMenuId === commentId ? null : commentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isEditing = editingCommentId === item.id;
    const canEdit = isUserComment(item.id);

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <UserAvatar 
            username={item.username || 'user'}
            size={36}
            backgroundColor="#6366F1"
          />
          
          <View style={styles.commentInfo}>
            <Text style={styles.commentAuthor}>
              {item.username ? `@${item.username}` : 'Anonymous User'}
            </Text>
            <View style={styles.commentMeta}>
              <Text style={styles.commentSpecialty}>
                {item.specialty || 'Nurse'}
              </Text>
              <Text style={styles.commentDot}>•</Text>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.commentTime}>
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>

          {canEdit && (
            <View style={styles.commentActions}>
              <TouchableOpacity 
                onPress={() => toggleMenu(item.id)}
                style={styles.menuButton}
              >
                <MoreVertical size={16} color="#6B7280" />
              </TouchableOpacity>
              
              {expandedMenuId === item.id && (
                <View style={styles.menuDropdown}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleEditComment(item)}
                  >
                    <Edit size={16} color="#6366F1" />
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleDeleteComment(item.id)}
                  >
                    <Trash size={16} color="#EF4444" />
                    <Text style={[styles.menuItemText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editingContent}
              onChangeText={setEditingContent}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  (!editingContent.trim() || isSubmitting) && styles.disabledButton
                ]}
                onPress={handleSaveEdit}
                disabled={!editingContent.trim() || isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentContent}>{item.content}</Text>
        )}
      </View>
    );
  };

  const renderCommentInput = () => (
    <View style={styles.commentInputContainer}>
      <TextInput
        style={styles.commentInput}
        placeholder={user ? "Add a comment..." : "Sign in to comment"}
        value={newComment}
        onChangeText={setNewComment}
        multiline
        editable={!!user}
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity
        style={[
          styles.commentButton,
          (!user || !newComment.trim() || isSubmitting) && styles.disabledButton
        ]}
        onPress={handleSubmitComment}
        disabled={!user || !newComment.trim() || isSubmitting}
      >
        <Send size={20} color={(!user || !newComment.trim() || isSubmitting) ? "#9CA3AF" : "#FFFFFF"} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageSquare size={20} color="#1F2937" />
        <Text style={styles.title}>Comments ({comments.length})</Text>
      </View>
      
      {renderCommentInput()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6366F1" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No comments yet. Be the first to share your thoughts!
          </Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 40,
    maxHeight: 120,
    paddingTop: 8,
  },
  commentButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  commentList: {
    paddingBottom: 20,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentSpecialty: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentActions: {
    position: 'relative',
  },
  menuButton: {
    padding: 4,
  },
  menuDropdown: {
    position: 'absolute',
    top: 24,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    width: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: '#1F2937',
  },
  deleteText: {
    color: '#EF4444',
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});