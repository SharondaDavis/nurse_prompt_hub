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
  Modal,
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
  User,
  Lock
} from 'lucide-react-native';
import { Auth } from '@/components/Auth';
import { useUser } from '@/hooks/useUser';

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

export default function SubmitScreen() {
  const router = useRouter();
  const { user, profile, isLoading: userLoading } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    category: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    }
    return undefined;
  };

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    const titleError = validateField('title', formData.title);
    if (titleError) newErrors.title = titleError;
    
    const contentError = validateField('content', formData.promptText);
    if (contentError) newErrors.content = contentError;
    
    const categoryError = validateField('category', formData.category);
    if (categoryError) newErrors.category = categoryError;
    
    return newErrors;
  };

  // Real-time validation
  React.useEffect(() => {
    const newErrors = validateForm();
    setErrors(newErrors);
  }, [formData.title, formData.promptText, formData.category]);

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      promptText: '',
      category: '',
      tags: [],
    });
    setNewTag('');
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async () => {
    // Mark all fields as touched to show validation errors
    setTouched({
      title: true,
      content: true,
      category: true,
    });

    if (!isFormValid()) {
      Alert.alert('Validation Error', 'Please fix the errors below before submitting.');
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
            resetForm();
            setShowPreview(false);
            router.push('/(tabs)/index');
          }
        }
      ]
    );
    
    setIsSubmitting(false);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const renderFieldError = (field: keyof ValidationErrors) => {
    if (touched[field] && errors[field]) {
      return (
        <View style={styles.errorContainer}>
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

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication requirement if user is not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthContainer}>
          <View style={styles.unauthContent}>
            <View style={styles.unauthIcon}>
              <Lock size={48} color="#6366F1" />
            </View>
            
            <Text style={styles.unauthTitle}>Sign In Required</Text>
            <Text style={styles.unauthSubtitle}>
              You need to be signed in to submit prompts to our community. Join thousands of nurses sharing their expertise.
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
              onPress={() => setShowAuth(true)}
              activeOpacity={0.9}
            >
              <LogIn size={20} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
            
            <Text style={styles.signInNote}>
              Join our community of nursing professionals
            </Text>
          </View>
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
    );
  }

  // Show preview modal
  if (showPreview) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  // Main form for authenticated users
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Submit New Prompt</Text>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {profile?.full_name || profile?.username || 'Nurse'}!</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                onBlur={() => handleFieldBlur('title')}
                placeholder="Enter a descriptive title for your nursing prompt"
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.fieldFooter}>
                {renderFieldError('title')}
                {getCharacterCount(formData.title, 100)}
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
                value={formData.promptText}
                onChangeText={(text) => setFormData(prev => ({ ...prev, promptText: text }))}
                onBlur={() => handleFieldBlur('content')}
                placeholder="Describe your nursing scenario, situation, or learning objective in detail..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <View style={styles.fieldFooter}>
                {renderFieldError('content')}
                {getCharacterCount(formData.promptText, 2000)}
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
                        formData.category === cat && styles.selectedOption,
                        touched.category && errors.category && !formData.category && styles.optionError,
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, category: cat }));
                        handleFieldBlur('category');
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          formData.category === cat && styles.selectedOptionText,
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
              <Text style={styles.label}>Tags (Optional)</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag"
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity 
                  style={[
                    styles.addTagButton,
                    (!newTag.trim() || formData.tags.length >= 5) && styles.addTagButtonDisabled
                  ]}
                  onPress={addTag}
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
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <X size={14} color="#6366F1" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.tagLimit}>
                {formData.tags.length}/5 tags {formData.tags.length >= 5 && '(Maximum reached)'}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.previewButton}
            onPress={() => setShowPreview(true)}
            disabled={!isFormValid()}
          >
            <Eye size={16} color="#6366F1" />
            <Text style={styles.previewButtonText}>Preview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!isFormValid() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
          >
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
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
    backgroundColor: '#F8FAFC',
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
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  userInfo: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
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
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
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
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  characterCountError: {
    color: '#EF4444',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionError: {
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#F0F4FF',
    padding: 12,
    borderRadius: 8,
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
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  tagText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  tagLimit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  footer: {
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