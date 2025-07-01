import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PromptHub } from '@/components/PromptHub';
import { PromptDetail } from '@/components/PromptDetail';
import { fetchPromptById, PromptWithUser } from '@/lib/fetchPrompts';
import { getPromptVersion, PromptVersionWithUser } from '@/lib/promptVersions';
import { Edit, ArrowLeft } from 'lucide-react-native';
import { PromptEditor } from '@/components/PromptEditor';
import { useUser } from '@/hooks/useUser';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUser();
  
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithUser | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersionWithUser | null>(null);
  const [showPromptDetail, setShowPromptDetail] = useState(false);
  const [showVersionDetail, setShowVersionDetail] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle category param from URL
  useEffect(() => {
    // If category was passed as a param, it will be handled by the PromptHub component
  }, [params.category]);

  const handlePromptPress = async (promptId: string) => {
    try {
      setLoading(true);
      const prompt = await fetchPromptById(promptId);
      
      if (prompt) {
        setSelectedPrompt(prompt);
        setShowPromptDetail(true);
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionPress = async (versionId: string) => {
    try {
      setLoading(true);
      const version = await getPromptVersion(versionId);
      
      if (version) {
        setSelectedVersion(version);
        setShowVersionDetail(true);
      }
    } catch (error) {
      console.error('Error fetching version:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrompt = () => {
    if (selectedPrompt) {
      setShowPromptDetail(false);
      setShowEditor(true);
    }
  };

  const handleSaveVersion = (versionId: string) => {
    setShowEditor(false);
    // Optionally, you could fetch and show the new version here
  };

  const renderPromptDetailHeader = () => (
    <View style={styles.modalHeader}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setShowPromptDetail(false)}
      >
        <ArrowLeft size={24} color="#6B7280" />
      </TouchableOpacity>
      
      <Text style={styles.modalTitle}>Prompt Details</Text>
      
      {user && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditPrompt}
        >
          <Edit size={20} color="#6366F1" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderVersionDetailHeader = () => (
    <View style={styles.modalHeader}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setShowVersionDetail(false)}
      >
        <ArrowLeft size={24} color="#6B7280" />
      </TouchableOpacity>
      
      <Text style={styles.modalTitle}>Version Details</Text>
      
      <View style={styles.headerPlaceholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PromptHub
        onPromptPress={handlePromptPress}
        onVersionPress={handleVersionPress}
      />
      
      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <Modal
          visible={showPromptDetail}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPromptDetail(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            {renderPromptDetailHeader()}
            <PromptDetail
              prompt={selectedPrompt}
              onClose={() => setShowPromptDetail(false)}
            />
          </SafeAreaView>
        </Modal>
      )}
      
      {/* Version Detail Modal */}
      {selectedVersion && (
        <Modal
          visible={showVersionDetail}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowVersionDetail(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            {renderVersionDetailHeader()}
            <View style={styles.versionDetailContainer}>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>
                  Version {selectedVersion.version_number}
                </Text>
              </View>
              
              <Text style={styles.versionTitle}>{selectedVersion.title}</Text>
              
              <View style={styles.versionMeta}>
                <View style={styles.versionCategory}>
                  <Text style={styles.versionCategoryText}>{selectedVersion.category}</Text>
                </View>
                {selectedVersion.specialty && (
                  <View style={styles.versionSpecialty}>
                    <Text style={styles.versionSpecialtyText}>{selectedVersion.specialty}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.versionContent}>{selectedVersion.content}</Text>
              
              {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                <View style={styles.versionTags}>
                  <Text style={styles.versionTagsTitle}>Tags:</Text>
                  <View style={styles.versionTagsContainer}>
                    {selectedVersion.tags.map((tag, index) => (
                      <View key={index} style={styles.versionTag}>
                        <Text style={styles.versionTagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {selectedVersion.change_summary && (
                <View style={styles.changeSummary}>
                  <Text style={styles.changeSummaryTitle}>Changes from original:</Text>
                  <Text style={styles.changeSummaryText}>{selectedVersion.change_summary}</Text>
                </View>
              )}
              
              <View style={styles.versionAuthor}>
                <Text style={styles.versionAuthorTitle}>Created by:</Text>
                <Text style={styles.versionAuthorName}>
                  {selectedVersion.username || 'Anonymous'}
                </Text>
                <Text style={styles.versionDate}>
                  {new Date(selectedVersion.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
      
      {/* Prompt Editor Modal */}
      {selectedPrompt && (
        <Modal
          visible={showEditor}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowEditor(false)}
        >
          <PromptEditor
            originalPrompt={selectedPrompt}
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  versionDetailContainer: {
    flex: 1,
    padding: 16,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  versionBadgeText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  versionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  versionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  versionCategory: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  versionCategoryText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  versionSpecialty: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  versionSpecialtyText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  versionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  versionTags: {
    marginBottom: 20,
  },
  versionTagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  versionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  versionTag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  versionTagText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  changeSummary: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
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
  versionAuthor: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  versionAuthorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  versionAuthorName: {
    fontSize: 14,
    color: '#6B7280',
  },
  versionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});