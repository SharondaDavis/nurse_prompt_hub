import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Send, 
  Eye, 
  X, 
  Plus, 
  LogIn,
  FileText,
  Tag,
  Layers,
  User
} from 'lucide-react-native';

const CATEGORIES = [
  'Code Blue Debrief',
  'Burnout Self-Check',
  'Shift Report Prep',
  'Prioritization Support',
  'Care Plan Helper',
  'Self-Care',
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: '#10B981' },
  { value: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
  { value: 'advanced', label: 'Advanced', color: '#EF4444' },
];

export default function Submit2Screen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock auth state
  
  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    category: '',
    tags: [],
    difficulty: 'beginner',
  });
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = () => {
    // Mock sign in - in real app this would navigate to auth flow
    setIsAuthenticated(true);
    Alert.alert('Success', 'You are now signed in!');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.promptText.trim() || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    Alert.alert(
      'Success!', 
      'Your prompt has been submitted and will be reviewed by our team.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setFormData({
              title: '',
              promptText: '',
              category: '',
              tags: [],
              difficulty: 'beginner',
            });
            setShowPreview(false);
            router.push('/(tabs)/home2');
          }
        }
      ]
    );
    
    setIsSubmitting(false);
  };

  const renderUnauthenticatedView = () => (
    <View style={styles.unauthContainer}>
      <View style={styles.unauthContent}>
        <View style={styles.unauthIcon}>
          <LogIn size={48} color="#6366F1" />
        </View>
        
        <Text style={styles.unauthTitle}>Sign In to Submit Prompts</Text>
        <Text style={styles.unauthSubtitle}>
          Join our community of nursing professionals to share your expertise and help others grow.
        </Text>
        
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <FileText size={20} color="#10B981" />
            <Text style={styles.benefitText}>Share your nursing scenarios</Text>
          </View>
          <View style={styles.benefitItem}>
            <User size={20} color="#6366F1" />
            <Text style={styles.benefitText}>Build your professional profile</Text>
          </View>
          <View style={styles.benefitItem}>
            <Tag size={20} color="#F59E0B" />
            <Text style={styles.benefitText}>Get recognized for contributions</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={handleSignIn}
          activeOpacity={0.9}
        >
          <LogIn size={20} color="#FFFFFF" />
          <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
        </TouchableOpacity>
        
        <Text style={styles.signInNote}>
          Already have an account? Sign in to continue
        </Text>
      </View>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Preview</Text>
        <TouchableOpacity 
          onPress={() => setShowPreview(false)}
          style={styles.closePreviewButton}
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.previewCard}>
          <View style={styles.previewCardHeader}>
            <View style={styles.previewCategory}>
              <Text style={styles.previewCategoryText}>{formData.category}</Text>
            </View>
            <View style={[
              styles.previewDifficulty,
              formData.difficulty === 'beginner' && styles.beginnerBadge,
              formData.difficulty === 'intermediate' && styles.intermediateBadge,
              formData.difficulty === 'advanced' && styles.advancedBadge,
            ]}>
              <Text style={[
                styles.previewDifficultyText,
                formData.difficulty === 'beginner' && styles.beginnerText,
                formData.difficulty === 'intermediate' && styles.intermediateText,
                formData.difficulty === 'advanced' && styles.advancedText,
              ]}>
                {formData.difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={styles.previewPromptTitle}>{formData.title}</Text>
          <Text style={styles.previewPromptText}>{formData.promptText}</Text>
          
          {formData.tags.length > 0 && (
            <View style={styles.previewTags}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.previewTag}>
                  <Text style={styles.previewTagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.previewActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setShowPreview(false)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Send size={16} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <KeyboardAvoidingView 
      style={styles.formContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.formScrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Submit a New Prompt</Text>
          <Text style={styles.formSubtitle}>
            Share your nursing expertise with the community
          </Text>
        </View>
        
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter a descriptive title for your prompt"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.inputHint}>
            {formData.title.length}/100 characters
          </Text>
        </View>
        
        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.selectedCategoryChip
                ]}
                onPress={() => setFormData(prev => ({ ...prev, category }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.category === category && styles.selectedCategoryChipText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Prompt Text */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Prompt Text <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your nursing scenario, situation, or learning objective in detail..."
            value={formData.promptText}
            onChangeText={(text) => setFormData(prev => ({ ...prev, promptText: text }))}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.inputHint}>
            {formData.promptText.length}/2000 characters
          </Text>
        </View>
        
        {/* Difficulty Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.difficultyChip,
                  formData.difficulty === level.value && [
                    styles.selectedDifficultyChip,
                    { backgroundColor: level.color }
                  ]
                ]}
                onPress={() => setFormData(prev => ({ ...prev, difficulty: level.value }))}
              >
                <Text style={[
                  styles.difficultyChipText,
                  formData.difficulty === level.value && styles.selectedDifficultyChipText
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags (Optional)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag"
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              style={[
                styles.addTagButton,
                (!newTag.trim() || formData.tags.length >= 5) && styles.addTagButtonDisabled
              ]}
              onPress={handleAddTag}
              disabled={!newTag.trim() || formData.tags.length >= 5}
            >
              <Plus size={16} color={(!newTag.trim() || formData.tags.length >= 5) ? "#9CA3AF" : "#6366F1"} />
            </TouchableOpacity>
          </View>
          
          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <X size={14} color="#6366F1" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.inputHint}>
            {formData.tags.length}/5 tags {formData.tags.length >= 5 && '(Maximum reached)'}
          </Text>
        </View>
      </ScrollView>
      
      {/* Form Actions */}
      <View style={styles.formActions}>
        <TouchableOpacity 
          style={styles.previewButton}
          onPress={() => setShowPreview(true)}
          disabled={!formData.title.trim() || !formData.promptText.trim() || !formData.category}
        >
          <Eye size={16} color="#6366F1" />
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!formData.title.trim() || !formData.promptText.trim() || !formData.category) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!formData.title.trim() || !formData.promptText.trim() || !formData.category || isSubmitting}
        >
          <Send size={16} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        {renderUnauthenticatedView()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {showPreview ? renderPreview() : renderForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Unauthenticated View Styles
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  unauthContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  unauthIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  unauthTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  unauthSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Form Styles
  formContainer: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
  },
  formHeader: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  inputGroup: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedDifficultyChip: {
    borderColor: 'transparent',
  },
  difficultyChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDifficultyChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addTagButton: {
    backgroundColor: '#F0F4FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  addTagButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  previewButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Preview Styles
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closePreviewButton: {
    padding: 8,
  },
  previewContent: {
    flex: 1,
    padding: 24,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewCategory: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  previewCategoryText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previewDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewDifficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  beginnerBadge: {
    backgroundColor: '#DCFCE7',
  },
  intermediateBadge: {
    backgroundColor: '#FEF3C7',
  },
  advancedBadge: {
    backgroundColor: '#FEE2E2',
  },
  beginnerText: {
    color: '#166534',
  },
  intermediateText: {
    color: '#92400E',
  },
  advancedText: {
    color: '#991B1B',
  },
  previewPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 28,
  },
  previewPromptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewTag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewTagText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
  },
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});