import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Plus } from 'lucide-react-native';

interface FloatingActionButton2Props {
  onPress: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  iconColor?: string;
  showLabel?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function FloatingActionButton2({
  onPress,
  style,
  size = 'medium',
  color = '#6366F1',
  iconColor = '#FFFFFF',
  showLabel = false,
  label = 'Add',
  disabled = false,
}: FloatingActionButton2Props) {
  const [scaleValue] = React.useState(new Animated.Value(1));

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
        };
      case 'large':
        return {
          width: 64,
          height: 64,
          borderRadius: 32,
        };
      default: // medium
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 28;
      default: // medium
        return 24;
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          getSizeStyles(),
          {
            backgroundColor: disabled ? '#D1D5DB' : color,
          },
          showLabel && styles.fabWithLabel,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled}
      >
        <Plus 
          size={getIconSize()} 
          color={disabled ? '#9CA3AF' : iconColor} 
        />
        {showLabel && (
          <Text style={[
            styles.label,
            { color: disabled ? '#9CA3AF' : iconColor }
          ]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
  fab: {
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
  } as ViewStyle,
  fabWithLabel: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    width: 'auto',
    minWidth: 56,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});