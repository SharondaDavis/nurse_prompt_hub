import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { X, Plus, Send, CircleAlert as AlertCircle, UserX } from 'lucide-react-native';
import { useSubmitPrompt } from '@/hooks/useSubmitPrompt';
import { Database } from '@/types/database';
import { Toast } from './Toast';

type Prompt = Database['public']['Tables']['prompts']['Row'];

interface PromptFormProps {
  onSuccess: (newPrompt: Prompt) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Code Blue Debrief',
  'Burnout Self-Check', 
  'Shift Report Prep',
  'Prioritization Support',
  'Care Plan Helper',
  'Self-Care',
];

const SPECIALTIES = [
  'icu',
  'er',
  'pediatrics',
  'med-surg',
  'oncology',
  'cardiac',
  'mental-health',
  'home-health',
  'ltc',
];

interface ValidationErrors {
  title?: string;
  content?: string;
  category?: string;
  specialty?: string;
}

export function PromptForm({ onSuccess, onCancel }: PromptFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Code Blue Debrief' | 'Burnout Self-Check' | 'Shift Report Prep' | 'Prioritization Support' | 'Care Plan Helper' | 'Self-Care' | ''>('');
  const [specialty, setSpecialty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true); // Default to anonymous
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);

  const { submit, isLoading, error } = useSubmitPrompt();

  // Validation logic
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 10) return 'Title must be at least 10 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        break;
      case 'content':
        if (!value.trim()) return 'Prompt content is required';
        if (value.trim().length < 50) return 'Content must be at least 50 characters';
        if (value.trim().length > 2000) return 'Content must be less than 2000 characters';
        break;
      case 'category':
        if (!value) return 'Category is required';
        break;
      case 'specialty':
        if (!value) return 'Specialty is required';
        break;
    }
    return undefined;
  };

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    const titleError = validateField('title', title);
    if (titleError) newErrors.title = titleError;
    
    const contentError = validateField('content', content);
    if (contentError) newErrors.content = contentError;
    
    const categoryError = validateField('category', category);
    if (categoryError) newErrors.category = categoryError;
    
    const specialtyError = validateField('specialty', specialty);
    if (specialtyError) newErrors.specialty = specialtyError;
    
    return newErrors;
  };

  // Real-time validation
  React.useEffect(() => {
    const newErrors = validateForm();
    setErrors(newErrors);
  }, [title, content, category, specialty]);

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setSpecialty('');
    setTags([]);
    setNewTag('');
    setIsAnonymous(true);
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async () => {
    // Mark all fields as touched to show validation errors
    setTouched({
      title: true,
      content: true,
      category: true,
      specialty: true,
    });

    if (!isFormValid()) {
      Alert.alert('Validation Error', 'Please fix the errors below before submitting.');
      return;
    }

    const promptData = {
      title: title.trim(),
      content: content.trim(),
      category,
      specialty,
      tags,
      difficulty_level: 'beginner' as const, // Default to beginner, but won't be shown in UI
      is_anonymous: isAnonymous,
    };

    try {
      // Create optimistic prompt for immediate UI update
      const optimisticPrompt: Prompt = {
        id: `temp-${Date.now()}`, // Temporary ID
        ...promptData,
        created_by: isAnonymous ? null : 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        votes: 0,
      };

      // Immediately update UI with optimistic prompt
      onSuccess(optimisticPrompt);

      // Submit to backend
      const actualPrompt = await submit(promptData);
      
      // Update with actual prompt data (this will replace the optimistic one)
      onSuccess(actualPrompt);
      
      // Show success toast
      setShowToast(true);
      
      // Reset form and close after a short delay to show the toast
      setTimeout(() => {
        resetForm();
      }, 1000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit prompt. Please try again.');
      // Note: The optimistic update will remain in the UI even if submission fails
      // You might want to implement a rollback mechanism here
    }
  };

  const handleToastHide = () => {
    setShowToast(false);
  };

  const renderFieldError = (field: keyof ValidationErrors) => {
    if (touched[field] && errors[field]) {
      return (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#D32F2F" />
          <Text style={styles.errorText}>{errors[field]}</Text>
        </View>
      );
    }
    return null;
  };

  const getCharacterCount = (text: string, max: number) => {
    const count = text.length;
    const isOverLimit = count > max;
    return (
      <Text style={[styles.characterCount, isOverLimit && styles.characterCountError]}>
        {count}/{max}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        visible={showToast}
        message="Prompt added!"
        type="success"
        duration={3000}
        onHide={handleToastHide}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Submit New Prompt</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <X size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.globalErrorContainer}>
              <AlertCircle size={20} color="#D32F2F" />
              <Text style={styles.globalErrorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  touched.title && errors.title && styles.inputError
                ]}
                value={title}
                onChangeText={setTitle}
                onBlur={() => handleFieldBlur('title')}
                placeholder="Enter a descriptive title for your nursing prompt"
                placeholderTextColor="#999999"
              />
              <View style={styles.fieldFooter}>
                {renderFieldError('title')}
                {getCharacterCount(title, 100)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Prompt Content <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  touched.content && errors.content && styles.inputError
                ]}
                value={content}
                onChangeText={setContent}
                onBlur={() => handleFieldBlur('content')}
                placeholder="Describe the nursing scenario, situation, or learning objective in detail. Include relevant context, patient information, and specific challenges or considerations."
                placeholderTextColor="#999999"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <View style={styles.fieldFooter}>
                {renderFieldError('content')}
                {getCharacterCount(content, 2000)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsContainer}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.option,
                        category === cat && styles.selectedOption,
                        touched.category && errors.category && !category && styles.optionError,
                      ]}
                      onPress={() => {
                        setCategory(cat as any);
                        handleFieldBlur('category');
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          category === cat && styles.selectedOptionText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {renderFieldError('category')}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Specialty <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsContainer}>
                  {SPECIALTIES.map((spec) => (
                    <TouchableOpacity
                      key={spec}
                      style={[
                        styles.option,
                        specialty === spec && styles.selectedOption,
                        touched.specialty && errors.specialty && !specialty && styles.optionError,
                      ]}
                      onPress={() => {
                        setSpecialty(spec);
                        handleFieldBlur('specialty');
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          specialty === spec && styles.selectedOptionText,
                        ]}
                      >
                        {spec.replace('-', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {renderFieldError('specialty')}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (Optional)</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag"
                  placeholderTextColor="#999999"
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity 
                  onPress={addTag} 
                  style={[
                    styles.addTagButton,
                    (!newTag.trim() || tags.length >= 5) && styles.addTagButtonDisabled
                  ]}
                  disabled={!newTag.trim() || tags.length >= 5}
                >
                  <Plus size={20} color={(!newTag.trim() || tags.length >= 5) ? "#999999" : "#7D3C98"} />
                </TouchableOpacity>
              </View>
              
              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <X size={14} color="#7D3C98" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.tagLimit}>
                {tags.length}/5 tags {tags.length >= 5 && '(Maximum reached)'}
              </Text>
            </View>

            {/* Anonymous Posting Option */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Attribution</Text>
              <TouchableOpacity
                style={styles.anonymousToggle}
                onPress={() => setIsAnonymous(!isAnonymous)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                  {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.anonymousToggleContent}>
                  <View style={styles.anonymousToggleHeader}>
                    <UserX size={16} color="#666666" />
                    <Text style={styles.anonymousToggleTitle}>Post Anonymously</Text>
                  </View>
                  <Text style={styles.anonymousToggleDescription}>
                    {isAnonymous 
                      ? "Your prompt will be posted without attribution to your username"
                      : "Your prompt will be credited to your username"
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton, 
              (!isFormValid() || isLoading) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid() || isLoading}
          >
            <Send size={20} color={(!isFormValid() || isLoading) ? "#999999" : "#FFFFFF"} />
            <Text style={[
              styles.submitButtonText,
              (!isFormValid() || isLoading) && styles.disabledButtonText
            ]}>
              {isLoading ? 'Submitting...' : 'Submit Prompt'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  keyboardView: {
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  globalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  globalErrorText: {
    color: '#D32F2F',
    fontSize: 14,
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputError: {
    borderColor: '#D32F2F',
    borderWidth: 2,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    flex: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
  },
  characterCountError: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#7D3C98',
    borderColor: '#7D3C98',
  },
  optionError: {
    borderColor: '#D32F2F',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  addTagButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7D3C98',
  },
  addTagButtonDisabled: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E5E5E5',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#7D3C98',
    fontSize: 14,
    marginRight: 6,
    fontWeight: '500',
  },
  tagLimit: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#7D3C98',
    borderColor: '#7D3C98',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  anonymousToggleContent: {
    flex: 1,
  },
  anonymousToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  anonymousToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  anonymousToggleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginRight: 8,
    minHeight: 52,
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#7D3C98',
    borderRadius: 12,
    marginLeft: 8,
    gap: 8,
    minHeight: 52,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  disabledButtonText: {
    color: '#999999',
  },
});