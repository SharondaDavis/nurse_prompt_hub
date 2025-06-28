import { useState } from 'react';
import { submitPrompt, SubmitPromptData } from '@/lib/submitPrompt';

export function useSubmitPrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: SubmitPromptData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await submitPrompt(data);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit prompt';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return {
    submit,
    isLoading,
    error,
    clearError,
  };
}