import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SearchBar } from './SearchBar';
import { PromptList } from './PromptList';
import { PromptForm } from './PromptForm';
import { fetchPrompts } from '@/lib/fetchPrompts';
import { Database } from '@/types/database';
import { Plus, BookOpen, Users, TrendingUp, Stethoscope } from 'lucide-react-native';

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  user_profiles: { full_name: string; specialty: string };
};

interface HomePageProps {
  showSubmitForm: boolean;
  onShowSubmitForm: (show: boolean) => void;
}

export function HomePage({ showSubmitForm, onShowSubmitForm }: HomePageProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showPromptDetail, setShowPromptDetail] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [prompts, searchQuery, selectedCategory, selectedSpecialty]);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts:', error);
      Alert.alert('Error', 'Failed to load prompts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrompts();
    setRefreshing(false);
  };

  const filterPrompts = () => {
    let filtered = [...prompts];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(prompt => prompt.specialty === selectedSpecialty);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPrompts(filtered);
  };

  const handlePromptPress = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptDetail(true);
  };

  const handleFormSuccess = () => {
    onShowSubmitForm(false);
    loadPrompts();
  };

  const renderPromptDetail = () => {
    if (!selectedPrompt) return null;

    return (
      <Modal
        visible={showPromptDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Prompt Details</Text>
            <TouchableOpacity
              onPress={() => setShowPromptDetail(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.detailTitle}>{selectedPrompt.title}</Text>
            
            <View style={styles.detailMeta}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{selectedPrompt.category}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{selectedPrompt.specialty}</Text>
              </View>
              <View style={[styles.metaBadge, styles.difficultyBadge]}>
                <Text style={styles.metaBadgeText}>{selectedPrompt.difficulty_level}</Text>
              </View>
            </View>

            <Text style={styles.detailContent}>{selectedPrompt.content}</Text>

            {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsTitle}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {selectedPrompt.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      #{tag}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.authorSection}>
              <Text style={styles.authorText}>
                By {selectedPrompt.user_profiles?.full_name || 'Anonymous'}
              </Text>
              <Text style={styles.dateText}>
                {new Date(selectedPrompt.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <BookOpen size={20} color="#14B8A6" />
        <Text style={styles.statNumber}>{prompts.length}</Text>
        <Text style={styles.statLabel}>Total Prompts</Text>
      </View>
      <View style={styles.statItem}>
        <Users size={20} color="#3B82F6" />
        <Text style={styles.statNumber}>
          {new Set(prompts.map(p => p.created_by)).size}
        </Text>
        <Text style={styles.statLabel}>Contributors</Text>
      </View>
      <View style={styles.statItem}>
        <TrendingUp size={20} color="#F59E0B" />
        <Text style={styles.statNumber}>
          {prompts.reduce((sum, p) => sum + p.votes, 0)}
        </Text>
        <Text style={styles.statLabel}>Total Votes</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLogo}>
            <Stethoscope size={32} color="#14B8A6" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Nurse Prompt Hub</Text>
            <Text style={styles.headerSubtitle}>Real Prompts for Real Nurses</Text>
          </View>
        </View>
      </View>

      {renderStats()}

      <SearchBar
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onSpecialtyChange={setSelectedSpecialty}
        selectedCategory={selectedCategory}
        selectedSpecialty={selectedSpecialty}
      />

      <PromptList
        prompts={filteredPrompts}
        onPromptPress={handlePromptPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        loading={isLoading}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => onShowSubmitForm(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showSubmitForm}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PromptForm
          onSuccess={handleFormSuccess}
          onCancel={() => onShowSubmitForm(false)}
        />
      </Modal>

      {renderPromptDetail()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  detailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metaBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  metaBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    backgroundColor: '#F0FDFA',
  },
  detailContent: {
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
  },
  tag: {
    fontSize: 14,
    color: '#14B8A6',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  authorSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  authorText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});