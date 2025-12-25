import { toast as sonnerToast } from 'sonner';
import { logError } from './sentry';

/**
 * Toast notification helpers
 * Replaces alert() with modern toast notifications
 */

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },

  error: (message: string, description?: string, error?: Error) => {
    sonnerToast.error(message, { description });

    // Log error to Sentry if provided
    if (error) {
      logError(error, { message, description });
    }
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },

  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, { description });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error: (err) => {
        const errorMsg = typeof error === 'function' ? error(err) : error;
        logError(err, { context: 'toast.promise' });
        return errorMsg;
      },
    });
  },
};

// Legacy compatibility - replace alert() calls with toast
export function replaceAlert(message: string) {
  if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
    toast.error(message);
  } else if (message.toLowerCase().includes('success')) {
    toast.success(message);
  } else {
    toast.info(message);
  }
}
