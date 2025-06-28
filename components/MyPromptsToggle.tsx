import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { User, Globe, LogIn } from 'lucide-react-native';

interface MyPromptsToggleProps {
  showMyPrompts: boolean;
  onToggle: (showMyPrompts: boolean) => void;
  myPromptsCount: number;
  totalPromptsCount: number;
  user?: any;
  onShowAuth: () => void;
}

export function MyPromptsToggle({
  showMyPrompts,
  onToggle,
  myPromptsCount,
  totalPromptsCount,
  user,
  onShowAuth,
}: MyPromptsToggleProps) {
  const handleMyPromptsPress = () => {
    if (!user) {
      onShowAuth();
      return;
    }
    onToggle(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            !showMyPrompts && styles.activeToggleOption,
          ]}
          onPress={() => onToggle(false)}
          activeOpacity={0.7}
        >
          <Globe size={16} color={!showMyPrompts ? '#FFFFFF' : '#666666'} />
          <Text
            style={[
              styles.toggleText,
              !showMyPrompts && styles.activeToggleText,
            ]}
          >
            All Prompts
          </Text>
          <View style={[
            styles.countBadge,
            !showMyPrompts && styles.activeCountBadge,
          ]}>
            <Text style={[
              styles.countText,
              !showMyPrompts && styles.activeCountText,
            ]}>
              {totalPromptsCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleOption,
            showMyPrompts && styles.activeToggleOption,
          ]}
          onPress={handleMyPromptsPress}
          activeOpacity={0.7}
        >
          {user ? (
            <User size={16} color={showMyPrompts ? '#FFFFFF' : '#666666'} />
          ) : (
            <LogIn size={16} color="#666666" />
          )}
          <Text
            style={[
              styles.toggleText,
              showMyPrompts && styles.activeToggleText,
            ]}
          >
            {user ? 'My Prompts' : 'Sign In'}
          </Text>
          {user && (
            <View style={[
              styles.countBadge,
              showMyPrompts && styles.activeCountBadge,
            ]}>
              <Text style={[
                styles.countText,
                showMyPrompts && styles.activeCountText,
              ]}>
                {myPromptsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  toggleOption: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
  },
  activeToggleOption: {
    backgroundColor: '#7D3C98',
    shadowColor: '#7D3C98',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
});