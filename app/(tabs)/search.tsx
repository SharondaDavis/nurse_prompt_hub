import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { MyPromptsToggle } from '@/components/MyPromptsToggle';
import { PromptList } from '@/components/PromptList';
import { PromptForm } from '@/components/PromptForm';
import { Auth } from '@/components/Auth';
import { PromptDetail } from '@/components/PromptDetail';
import { fetchPrompts, getTotalPromptsCount, PromptWithUser } from '@/lib/fetchPrompts';
import { Database } from '@/types/database';
import { useUser } from '@/hooks/useUser';
import { Search, Plus } from 'lucide-react-native';

type Prompt = Database['public']['Tables']['prompts']['Row'];

const PROMPTS_PER_PAGE = 5;

export default function SearchScreen() {
  const { user } = useUser();
  const [prompts, setPrompts] = useState<PromptWithUser[]>([]);
  const [myPrompts, setMyPrompts] = useState<PromptWithUser[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithUser | null>(null);
  const [showPromptDetail, setShowPromptDetail] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMyPrompts, setShowMyPrompts] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePrompts, setHasMorePrompts] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadPrompts(true); // Reset on initial load
  }, []);

  useEffect(() => {
    if (user) {
      loadMyPrompts();
    } else {
      setMyPrompts([]);
      setShowMyPrompts(false);
    }
  }, [user]);

  useEffect(() => {
    // Reset pagination when filters change
    setCurrentPage(0);
    setFilteredPrompts([]);
    loadPrompts(true);
  }, [searchQuery, selectedCategory, selectedSpecialty, showMyPrompts]);

  const loadPrompts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentPage(0);
        setFilteredPrompts([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : currentPage + 1;
      const offset = page * PROMPTS_PER_PAGE;

      const options = {
        limit: PROMPTS_PER_PAGE,
        offset,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        search: searchQuery.trim() || undefined,
        userId: showMyPrompts && user ? user.id : undefined,
      };

      const [newPrompts, count] = await Promise.all([
        fetchPrompts(options),
        getTotalPromptsCount({
          category: options.category,
          specialty: options.specialty,
          search: options.search,
          userId: options.userId,
        })
      ]);

      if (reset) {
        setFilteredPrompts(newPrompts);
        setPrompts(showMyPrompts ? [] : newPrompts);
      } else {
        setFilteredPrompts(prev => [...prev, ...newPrompts]);
        if (!showMyPrompts) {
          setPrompts(prev => [...prev, ...newPrompts]);
        }
      }

      setCurrentPage(page);
      setTotalCount(count);
      setHasMorePrompts(offset + newPrompts.length < count);

    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMyPrompts = async () => {
    if (!user) return;
    
    try {
      const data = await fetchPrompts({ userId: user.id, limit: 100 }); // Load all user prompts
      setMyPrompts(data);
    } catch (error) {
      console.error('Error loading my prompts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrompts(true);
    if (user) {
      await loadMyPrompts();
    }
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMorePrompts) {
      loadPrompts(false);
    }
  };

  const handlePromptPress = (prompt: PromptWithUser) => {
    setSelectedPrompt(prompt);
    setShowPromptDetail(true);
  };

  const handleAddPromptPress = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowSubmitForm(true);
    }
  };

  const handleFormSuccess = (newPrompt: Prompt) => {
    // Create a PromptWithUser object for the new prompt
    const promptWithUser: PromptWithUser = {
      ...newPrompt,
      user_profiles: user ? {
        username: user.email?.split('@')[0] || 'new_user',
        full_name: 'Current User',
        specialty: 'General',
      } : undefined,
    };

    // Add to the beginning of the lists
    setPrompts(prevPrompts => [promptWithUser, ...prevPrompts]);
    setFilteredPrompts(prevFiltered => [promptWithUser, ...prevFiltered]);

    // If the new prompt is by the current user, add it to myPrompts
    if (user && newPrompt.created_by === user.id) {
      setMyPrompts(prevMyPrompts => [promptWithUser, ...prevMyPrompts]);
    }
    
    setShowSubmitForm(false);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleToggleMyPrompts = (showMy: boolean) => {
    setShowMyPrompts(showMy);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const renderAddPromptButton = () => (
    <View style={styles.addPromptSection}>
      <TouchableOpacity
        style={styles.addPromptButton}
        onPress={handleAddPromptPress}
        activeOpacity={0.8}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addPromptButtonText}>
          {user ? 'Add New Prompt' : 'Sign In to Add Prompt'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.addPromptSubtext}>
        Share your nursing expertise with the community
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View>
      <View style={styles.searchInfo}>
        <View style={styles.searchInfoHeader}>
          <View style={styles.searchInfoIcon}>
            <Search size={32} color="#3B82F6" />
          </View>
          <Text style={styles.searchInfoTitle}>
            {showMyPrompts ? 'My Prompts' : 'Search Prompts'}
          </Text>
          <Text style={styles.searchInfoSubtitle}>
            {filteredPrompts.length} of {totalCount} prompt{totalCount !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>
      {renderAddPromptButton()}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <EnhancedHeader
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      {/* Show My Prompts toggle for all users, but handle auth in the component */}
      <MyPromptsToggle
        showMyPrompts={showMyPrompts}
        onToggle={handleToggleMyPrompts}
        myPromptsCount={myPrompts.length}
        totalPromptsCount={prompts.length}
        user={user}
        onShowAuth={handleShowAuth}
      />

      {/* Single FlatList that handles all content */}
      <PromptList
        prompts={filteredPrompts}
        onPromptPress={handlePromptPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        loading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={hasMorePrompts}
        loadingMore={loadingMore}
        ListHeaderComponent={renderListHeader}
      />

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

      <Modal
        visible={showSubmitForm}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PromptForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowSubmitForm(false)}
        />
      </Modal>

      <Modal
        visible={showPromptDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {selectedPrompt && (
            <PromptDetail
              prompt={selectedPrompt}
              onClose={() => setShowPromptDetail(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  searchInfo: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInfoHeader: {
    alignItems: 'center',
  },
  searchInfoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInfoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  searchInfoSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  addPromptSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  addPromptButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D3C98',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#7D3C98',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 200,
  },
  addPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  addPromptSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});