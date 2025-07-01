import { Platform, StyleSheet, ViewStyle } from 'react-native';

interface ShadowProps {
  color?: string;
  opacity?: number;
  radius?: number;
  offset?: { width: number; height: number };
  elevation?: number;
}

/**
 * Creates cross-platform shadow styles that work consistently across iOS, Android and Web
 * 
 * @param {ShadowProps} options - Shadow configuration options
 * @returns {ViewStyle} Platform-specific shadow styles
 */
export function createShadow({
  color = '#000',
  opacity = 0.1,
  radius = 4,
  offset = { width: 0, height: 2 },
  elevation = 3,
}: ShadowProps = {}): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
      // Android needs these to properly show shadows with elevation
      shadowColor: color,
      shadowOpacity: 1,
    },
    web: {
      // For web, we use boxShadow CSS property
      // Format: "offsetX offsetY blurRadius spreadRadius color"
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    },
  }) ?? {}; // Fallback to empty object if Platform.select returns undefined
}

/**
 * Predefined shadow styles for common use cases
 */
export const shadowStyles = StyleSheet.create({
  small: createShadow({
    opacity: 0.1,
    radius: 2,
    offset: { width: 0, height: 1 },
    elevation: 2,
  }),
  
  medium: createShadow({
    opacity: 0.15,
    radius: 4,
    offset: { width: 0, height: 2 },
    elevation: 4,
  }),
  
  large: createShadow({
    opacity: 0.2,
    radius: 8,
    offset: { width: 0, height: 4 },
    elevation: 8,
  }),
  
  button: createShadow({
    color: '#6366F1', // Indigo color for buttons
    opacity: 0.3,
    radius: 6,
    offset: { width: 0, height: 3 },
    elevation: 5,
  }),
  
  card: createShadow({
    opacity: 0.1,
    radius: 6,
    offset: { width: 0, height: 2 },
    elevation: 3,
  }),
  
  modal: createShadow({
    opacity: 0.25,
    radius: 12,
    offset: { width: 0, height: 8 },
    elevation: 10,
  }),
});

/**
 * Usage examples:
 * 
 * // Using predefined shadow:
 * <View style={[styles.container, shadowStyles.medium]}>...</View>
 * 
 * // Using custom shadow:
 * <View style={[styles.container, createShadow({ opacity: 0.2, radius: 10 })]}>...</View>
 * 
 * // Combining with other styles:
 * const styles = StyleSheet.create({
 *   container: {
 *     ...createShadow(),
 *     backgroundColor: 'white',
 *     borderRadius: 8,
 *   }
 * });
 */