import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Platform
} from 'react-native';

interface DataItem {
  id: string;
  title: string;
  description: string;
}

interface ErrorState {
  message: string;
  code?: string;
}

/**
 * Component that demonstrates safe state management with async operations
 * Properly handles component unmounting during async operations
 */
export default function SafeAsyncComponent() {
  // State variables
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Simulate fetching data from an API
  const fetchData = async () => {
    // Only set loading state if component is still mounted
    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }

    try {
      // Simulate network request
      const response = await new Promise<DataItem[]>((resolve, reject) => {
        // Simulate random success/failure
        const shouldFail = Math.random() < 0.3;
        
        setTimeout(() => {
          if (shouldFail) {
            reject(new Error('Failed to fetch data. Network error.'));
          } else {
            resolve([
              { id: '1', title: 'Item 1', description: 'Description for item 1' },
              { id: '2', title: 'Item 2', description: 'Description for item 2' },
              { id: '3', title: 'Item 3', description: 'Description for item 3' },
            ]);
          }
        }, 1500); // Simulate network delay
      });

      // Only update state if component is still mounted
      if (isMounted.current) {
        setData(response);
      }
    } catch (err) {
      // Only update error state if component is still mounted
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError({ message: errorMessage });
        console.error('Error fetching data:', err);
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Handle platform-specific operations
  const handlePlatformSpecificOperation = async () => {
    if (isMounted.current) {
      setLoading(true);
    }

    try {
      // Use Platform.select to handle platform differences
      const platformSpecificOperation = Platform.select({
        ios: async () => {
          // iOS-specific async operation
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'iOS operation completed';
        },
        android: async () => {
          // Android-specific async operation
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'Android operation completed';
        },
        web: async () => {
          // Web-specific async operation
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'Web operation completed';
        },
        default: async () => {
          // Default fallback
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'Operation completed';
        },
      });

      const result = await platformSpecificOperation?.();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setData(prevData => [
          ...prevData, 
          { 
            id: Date.now().toString(), 
            title: 'Platform Result', 
            description: result || 'No result' 
          }
        ]);
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Platform operation failed';
        setError({ message: errorMessage, code: 'PLATFORM_ERROR' });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Fetch data on component mount and when retryCount changes
  useEffect(() => {
    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [retryCount]);

  // Retry handler
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        {error.code && (
          <Text style={styles.errorCode}>Code: {error.code}</Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render data
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safe Async Component</Text>
      
      <View style={styles.dataContainer}>
        {data.length === 0 ? (
          <Text style={styles.emptyText}>No data available</Text>
        ) : (
          data.map(item => (
            <View key={item.id} style={styles.dataItem}>
              <Text style={styles.dataItemTitle}>{item.title}</Text>
              <Text style={styles.dataItemDescription}>{item.description}</Text>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRetry}
        >
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.platformButton} 
          onPress={handlePlatformSpecificOperation}
        >
          <Text style={styles.platformButtonText}>
            Run {Platform.OS} Operation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorCode: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
      },
    }),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    flex: 1,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
  dataItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  dataItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dataItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
      },
    }),
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  platformButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
      },
    }),
  },
  platformButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});