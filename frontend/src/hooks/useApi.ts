import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any, D = any>(
  url: string,
  method: HttpMethod = 'GET',
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { onSuccess, onError, successMessage, errorMessage } = options;

  const execute = useCallback(
    async (body?: D, params?: Record<string, string | number>) => {
      setIsLoading(true);
      setError(null);
      
      try {
        let response;
        const config = { params };
        
        switch (method) {
          case 'GET':
            response = await apiClient.get<T>(url, config);
            break;
          case 'POST':
            response = await apiClient.post<T>(url, body, config);
            break;
          case 'PUT':
            response = await apiClient.put<T>(url, body, config);
            break;
          case 'DELETE':
            response = await apiClient.delete<T>(url, config);
            break;
          case 'PATCH':
            response = await apiClient.patch<T>(url, body, config);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        setData(response.data);
        
        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
            variant: 'default',
          });
        }
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return response.data;
      } catch (err) {
        console.error(`API Error (${method} ${url}):`, err);
        setError(err);
        
        const message = errorMessage || 'An error occurred. Please try again.';
        
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        
        if (onError) {
          onError(err);
        }
        
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, onSuccess, onError, successMessage, errorMessage, toast]
  );

  return { data, error, isLoading, execute };
}

export function useGet<T = any>(url: string, options?: Omit<UseApiOptions<T>, 'onSuccess' | 'onError'>) {
  return useApi<T>(url, 'GET', options);
}

export function usePost<T = any, D = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T, D>(url, 'POST', options);
}

export function usePut<T = any, D = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T, D>(url, 'PUT', options);
}

export function useDelete<T = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T>(url, 'DELETE', options);
}

export function usePatch<T = any, D = any>(url: string, options?: UseApiOptions<T>) {
  return useApi<T, D>(url, 'PATCH', options);
}
