import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface UserAvatarProps {
  username?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function UserAvatar({
  username,
  size = 32,
  backgroundColor = '#7D3C98',
  textColor = '#FFFFFF',
}: UserAvatarProps) {
  const getInitials = (username: string): string => {
    if (!username) return '?';
    
    // Remove common prefixes and suffixes
    const cleanUsername = username.replace(/^(rn_|nurse_|dr_)/, '').replace(/(_rn|_nurse|_md)$/, '');
    
    // Split by underscores and take first letter of each part
    const parts = cleanUsername.split('_');
    
    if (parts.length >= 2) {
      // If we have multiple parts, use first letter of first two parts
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      // If single part, use first two letters
      return cleanUsername.substring(0, 2).toUpperCase();
    }
  };

  const initials = username ? getInitials(username) : '?';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: textColor,
            fontSize: size * 0.4, // Scale font size with avatar size
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  initials: {
    fontWeight: '700',
    textAlign: 'center',
  },
});