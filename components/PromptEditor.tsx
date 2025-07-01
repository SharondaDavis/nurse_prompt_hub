import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { 
  X, 
  Save, 
  Tag, 
  Plus, 
  Eye, 
  ArrowLeft,
  CheckSquare,
  Clock,
  FileText,
  History
} from 'lucide-react-native';
import { CATEGORIES } from '@/lib/categories';
import { PromptWithUser } from '@/lib/fetchPrompts';
import { createPromptVersion, publishPromptVersion } from '@/lib/promptVersions';
import { useUser } from '@/hooks/useUser';

interface PromptEditorProps {
  originalPrompt: PromptWithUser;
  onClose: () => void;
  onSave: (versionId: string) => void;
}

const SPECIALTIES = [
  { id: 'icu', label: 'ICU' },
  { id: 'er', label: 'Emergency Room' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'med-surg', label: 'Med-Surg' },
  { id: 'oncology', label: 'Oncology' },
  { id: 'cardiac', label: 'Cardiac' },
  { id: 'mental-health', label: 'Mental Health' },
  { id: 'home-health', label: 'Home Health' },
  { id: 'ltc', label: 'Long-term Care' },
];

export function PromptEditor({ originalPrompt, onClose, onSave }: PromptEditorProps) {
  const { user } = useUser();
  const [title, setTitle] = useState(originalPrompt.title);
  const [content, setContent] = useState(originalPrompt.content);
  const [category, setCategory] = useState(originalPrompt.category);
  const [specialty, setSpecialty] = useState(originalPrompt.specialty || '');
  const [tags, setTags] = useState<string[]>(originalPrompt.tags || []);
  const [newTag, setNewTag] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showChangeSummaryModal, setShowChangeSummaryModal] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation
  useEffect(() => {
    validateForm();
  }, [title, content, category, specialty]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.trim().length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    if (!specialty) {
      newErrors.specialty = 'Specialty is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    // Mark all fields as touched for validation
    setTouched({
      title: true,
      content: true,
      category: true,
      specialty: true,
    });
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }
    
    if (!changeSummary.trim()) {
      setShowChangeSummaryModal(true);
      return;
    }
    
    await saveVersion();
  };

  const saveVersion = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to edit prompts.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const versionData = {
        originalPromptId: originalPrompt.id,
        title,
        content,
        category,
        specialty,
        tags,
        changeSummary,
      };
      
      const newVersion = await createPromptVersion(versionData);
      
      if (newVersion) {
        Alert.alert(
          'Success',
          'Your edited version has been saved. Would you like to publish it now?',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => {
                onSave(newVersion.id);
              },
            },
            {
              text: 'Publish',
              onPress: async () => {
                try {
                  await publishPromptVersion(newVersion.id);
                  Alert.alert('Published!', 'Your version has been published successfully.');
                  onSave(newVersion.id);
                } catch (error) {
                  console.error('Error publishing version:', error);
                  Alert.alert('Error', 'Failed to publish version. Please try again.');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving version:', error);
      Alert.alert('Error', 'Failed to save version. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitChangeSummary = () => {
    if (!changeSummary.trim()) {
      Alert.alert('Error', 'Please provide a summary of your changes.');
      return;
    }
    
    setShowChangeSummaryModal(false);
    saveVersion();
  };

  const renderFieldError = (field: string) => {
    if (touched[field] && errors[field]) {
      return <Text style={styles.errorText}>{errors[field]}</Text>;
    }
    return null;
  };

  // Preview mode
  if (showPreview) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Preview</Text>
          <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.previewContainer}>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>{title}</Text>
            
            <View style={styles.previewMeta}>
              <View style={styles.previewCategory}>
                <Text style={styles.previewCategoryText}>{category}</Text>
              </View>
              {specialty && (
                <View style={styles.previewSpecialty}>
                  <Text style={styles.previewSpecialtyText}>{specialty}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.previewContentText}>{content}</Text>
            
            {tags.length > 0 && (
              <View style={styles.previewTags}>
                <Text style={styles.previewTagsTitle}>Tags:</Text>
                <View style={styles.previewTagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.previewTag}>
                      <Text style={styles.previewTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.previewChanges}>
              <Text style={styles.previewChangesTitle}>Changes from original:</Text>
              <Text style={styles.previewChangesText}>{changeSummary || 'No change summary provided.'}</Text>
            </View>
            
            <View style={styles.previewOriginal}>
              <Text style={styles.previewOriginalTitle}>Original Prompt:</Text>
              <Text style={styles.previewOriginalAuthor}>
                By {originalPrompt.user_profiles?.username || 'Anonymous'}
              </Text>
              <Text style={styles.previewOriginalDate}>
                Created {new Date(originalPrompt.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={styles.previewBackButton}
            onPress={() => setShowPreview(false)}
          >
            <ArrowLeft size={20} color="#6B7280" />
            <Text style={styles.previewBackButtonText}>Back to Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.previewSaveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.previewSaveButtonText}>Save Version</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Prompt</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.editorContainer}>
          <View style={styles.originalInfo}>
            <History size={16} color="#6B7280" />
            <Text style={styles.originalInfoText}>
              Editing: {originalPrompt.title}
            </Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, touched.title && errors.title && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              onBlur={() => handleFieldBlur('title')}
              placeholder="Enter prompt title"
              placeholderTextColor="#9CA3AF"
            />
            {renderFieldError('title')}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.textArea, touched.content && errors.content && styles.inputError]}
              value={content}
              onChangeText={setContent}
              onBlur={() => handleFieldBlur('content')}
              placeholder="Enter prompt content"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
            {renderFieldError('content')}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.slice(1).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.selectedCategoryOption,
                    { backgroundColor: category === cat.id ? cat.color : '#F3F4F6' }
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    handleFieldBlur('category');
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat.id && styles.selectedCategoryOptionText,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {renderFieldError('category')}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Specialty *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.specialtiesContainer}
            >
              {SPECIALTIES.map((spec) => (
                <TouchableOpacity
                  key={spec.id}
                  style={[
                    styles.specialtyOption,
                    specialty === spec.id && styles.selectedSpecialtyOption,
                  ]}
                  onPress={() => {
                    setSpecialty(spec.id);
                    handleFieldBlur('specialty');
                  }}
                >
                  <Text
                    style={[
                      styles.specialtyOptionText,
                      specialty === spec.id && styles.selectedSpecialtyOptionText,
                    ]}
                  >
                    {spec.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {renderFieldError('specialty')}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity 
                style={[
                  styles.addTagButton,
                  !newTag.trim() && styles.addTagButtonDisabled
                ]}
                onPress={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus size={16} color={!newTag.trim() ? "#9CA3AF" : "#6366F1"} />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <X size={14} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Change Summary</Text>
            <TextInput
              style={styles.textArea}
              value={changeSummary}
              onChangeText={setChangeSummary}
              placeholder="Describe what changes you made to the original prompt"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.previewButton}
          onPress={() => setShowPreview(true)}
        >
          <Eye size={20} color="#6366F1" />
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Version</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Change Summary Modal */}
      <Modal
        visible={showChangeSummaryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChangeSummaryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChangeSummaryModal(false)}
        >
          <View style={styles.changeSummaryModal}>
            <View style={styles.changeSummaryHeader}>
              <Text style={styles.changeSummaryTitle}>Describe Your Changes</Text>
              <TouchableOpacity onPress={() => setShowChangeSummaryModal(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.changeSummaryDescription}>
              Please provide a brief summary of the changes you made to the original prompt.
              This helps others understand how your version differs.
            </Text>
            
            <TextInput
              style={styles.changeSummaryInput}
              value={changeSummary}
              onChangeText={setChangeSummary}
              placeholder="e.g., Added more detailed instructions, fixed typos, expanded scenarios..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.changeSummaryActions}>
              <TouchableOpacity 
                style={styles.changeSummaryCancelButton}
                onPress={() => setShowChangeSummaryModal(false)}
              >
                <Text style={styles.changeSummaryCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.changeSummarySubmitButton,
                  !changeSummary.trim() && styles.changeSummarySubmitDisabled
                ]}
                onPress={handleSubmitChangeSummary}
                disabled={!changeSummary.trim()}
              >
                <Text style={styles.changeSummarySubmitText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  editorContainer: {
    padding: 16,
  },
  originalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  originalInfoText: {
    fontSize: 14,
    color: '#6366F1',
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryOption: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  specialtyOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  selectedSpecialtyOption: {
    backgroundColor: '#8B5CF6',
  },
  specialtyOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedSpecialtyOptionText: {
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
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  addTagButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
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
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
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
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Preview styles
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  previewCategory: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewCategoryText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  previewSpecialty: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewSpecialtyText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  previewContentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  previewTags: {
    marginBottom: 20,
  },
  previewTagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  previewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewTag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewTagText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  previewChanges: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewChangesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  previewChangesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  previewOriginal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  previewOriginalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  previewOriginalAuthor: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewOriginalDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  previewBackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewBackButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  previewSaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewSaveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Change Summary Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  changeSummaryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  changeSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  changeSummaryDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  changeSummaryInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  changeSummaryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  changeSummaryCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  changeSummaryCancelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  changeSummarySubmitButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeSummarySubmitDisabled: {
    backgroundColor: '#9CA3AF',
  },
  changeSummarySubmitText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});