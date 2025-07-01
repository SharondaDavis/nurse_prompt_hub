import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  fetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  reset: () => void;
}

/**
 * A custom hook for safely fetching async data with proper cleanup
 * to prevent state updates on unmounted components
 */
export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const {
    initialData = null,
    fetchOnMount = true,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef<boolean>(true);

  // Function to fetch data safely
  const fetchData = async (): Promise<void> => {
    // Only set loading state if component is still mounted
    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }

    try {
      // Handle platform-specific behavior if needed
      const platformSpecificDelay = Platform.select({
        ios: 100,
        android: 200,
        web: 0,
        default: 0,
      });

      // Add artificial delay for platform-specific behavior demonstration
      if (platformSpecificDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, platformSpecificDelay));
      }

      // Call the provided async function
      const result = await asyncFunction();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setData(result);
        setError(null);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      // Only update error state if component is still mounted
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        
        // Call onError callback if provided
        if (onError) {
          onError(error);
        }
        
        // Log error for debugging
        console.error('Error in useAsyncData:', error);
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Reset function to clear data and errors
  const reset = (): void => {
    if (isMounted.current) {
      setData(initialData);
      setError(null);
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    // Reset the isMounted ref to true when the component mounts
    isMounted.current = true;
    
    if (fetchOnMount) {
      fetchData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [...dependencies]);

  return {
    data,
    loading,
    error,
    fetch: fetchData,
    reset,
  };
}