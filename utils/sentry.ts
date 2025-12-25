import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize Sentry if DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'development',

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring sample rate
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,

    // Session Replay sample rate
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'development',

    // Before sending events
    beforeSend(event, hint) {
      // Filter out non-error logs in production
      if (import.meta.env.MODE === 'production') {
        if (event.level === 'log' || event.level === 'info') {
          return null;
        }
      }

      // Don't send events for localhost in development
      if (import.meta.env.MODE === 'development' && window.location.hostname === 'localhost') {
        console.log('Sentry event (dev mode):', event);
        return null;
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Random network errors
      'NetworkError',
      'Network request failed',
      // Irrelevant React errors
      'ResizeObserver loop limit exceeded',
    ],
  });
}

// Custom error logging helpers
export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUserContext(userId: string, email?: string, role?: string) {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
