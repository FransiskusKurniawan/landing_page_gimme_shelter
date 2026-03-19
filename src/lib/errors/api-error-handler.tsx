import { toast } from 'sonner';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced error data interfaces based on your API responses
interface ValidationError {
  field: string;
  detail: string;
}

interface ApiErrorResponse {
  message?: string;
  status?: string;
  errors?: ValidationError[];
}

export function extractErrorMessage(errorData: unknown, fallback: string): string {
  if (errorData && typeof errorData === 'object') {
    const apiError = errorData as ApiErrorResponse;
    
    // Check for 'error' field first (most common in your API)
    if ('error' in errorData && typeof (errorData as any).error === 'string') {
      return (errorData as any).error;
    }
    
    // Check for validation errors array
    if (apiError.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
      return apiError.errors.map(err => `${err.field}: ${err.detail}`).join(', ');
    }
    
    // Check for message field
    if (apiError.message && typeof apiError.message === 'string') {
      return apiError.message;
    }
  }
  return fallback;
}

// Global error handler with automatic toast notifications
export class GlobalErrorHandler {
  static handleApiError(
    error: unknown,
    statusCode?: number,
    showToast: boolean = true,
    context?: string
  ): ApiError {
    let apiError: ApiError;
    
    if (error instanceof ApiError) {
      apiError = error;
    } else {
    const errorMessage = extractErrorMessage(error, 'An unknown error occurred');
    apiError = new ApiError(errorMessage, statusCode, undefined, error);
  }

  if (showToast) {
    this.showErrorToast(apiError);
  }

  return apiError;
}

  private static showErrorToast(apiError: ApiError): void {
    const statusCode = apiError.statusCode;
    const message = apiError.message;
    const errorData = apiError.data as ApiErrorResponse;

    if (statusCode === 400 && errorData?.errors && Array.isArray(errorData.errors)) {
      const validationMessages = errorData.errors.map(err => 
        `${err.field}: ${err.detail}`
      );
      
      toast.error('Validation Error', {
        description: validationMessages.join('\n'),
        duration: 5000,
      });
      return;
    }

    if (statusCode === 400) {
      if (message.toLowerCase().includes('already exists')) {
        toast.error('Duplicate Entry', {
          description: message,
          duration: 4000,
        });
        return;
      }
      
      if (message.toLowerCase().includes('validation failed')) {
        toast.error('Validation Failed', {
          description: message,
          duration: 4000,
        });
        return;
      }
      
      toast.error('Bad Request', {
        description: message,
        duration: 4000,
      });
      return;
    }

    if (statusCode === 401) {
      toast.error('Authentication Failed', {
        description: 'Please login again to continue',
        duration: 4000,
      });
      return;
    }

    if (statusCode === 403) {
      toast.error('Access Denied', {
        description: 'You do not have permission to perform this action',
        duration: 4000,
      });
      return;
    }

    if (statusCode === 404) {
      toast.error('Not Found', {
        description: message || 'The requested resource was not found',
        duration: 4000,
      });
      return;
    }

    if (statusCode && statusCode >= 500) {
      toast.error('Server Error', {
        description: 'Something went wrong on our end. Please try again later.',
        duration: 5000,
      });
      return;
    }

    toast.error('Error', {
      description: message || 'An unexpected error occurred',
      duration: 4000,
    });
  }

  static showSuccess(message: string, description?: string): void {
    toast.success(message, {
      description,
      duration: 3000,
    });
  }

  static showInfo(message: string, description?: string): void {
    toast.info(message, {
      description,
      duration: 3000,
    });
  }
}

interface ErrorHandlerOptions {
  fallbackMessage: string;
  context?: Record<string, unknown>;
}

export class ApiErrorHandler {
  static handleAuth(error: unknown, options: ErrorHandlerOptions): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    const message = error instanceof Error ? error.message : options.fallbackMessage;
    console.error(`[Auth Error]${options.context ? ` ${JSON.stringify(options.context)}` : ''}:`, error);
    
    return new ApiError(message, undefined, 'AUTH_ERROR', error);
  }

  static handleSilent(error: unknown, options: ErrorHandlerOptions): void {
    console.warn(`[Silent Error]${options.context ? ` ${JSON.stringify(options.context)}` : ''}:`, error);
  }
}
