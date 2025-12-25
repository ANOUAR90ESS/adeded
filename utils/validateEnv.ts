import { z } from 'zod';

/**
 * Environment variable validation
 * Validates all required environment variables at startup
 */

const envSchema = z.object({
  // Supabase Configuration
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),

  // Gemini API (optional for frontend, required for backend)
  GEMINI_API_KEY: z.string().optional(),

  // Stripe Configuration (backend only)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Admin Configuration
  VITE_ADMIN_EMAILS: z.string().optional(),

  // Sentry Configuration (optional)
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // App Configuration
  VITE_APP_VERSION: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

// Backend-specific required fields
const backendEnvSchema = envSchema.extend({
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required for backend'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required for backend'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required for backend'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required for backend'),
});

type Env = z.infer<typeof envSchema>;
type BackendEnv = z.infer<typeof backendEnvSchema>;

/**
 * Validate frontend environment variables
 */
export function validateFrontendEnv() {
  try {
    // Get environment variables from both import.meta.env and process.env
    const env = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
      VITE_ADMIN_EMAILS: import.meta.env.VITE_ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN || '',
      SENTRY_ORG: import.meta.env.SENTRY_ORG || process.env.SENTRY_ORG,
      SENTRY_PROJECT: import.meta.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT,
      SENTRY_AUTH_TOKEN: import.meta.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || process.env.VITE_APP_VERSION,
      NODE_ENV: import.meta.env.MODE || process.env.NODE_ENV,
      GEMINI_API_KEY: import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );

      console.error('❌ Environment validation failed:');
      errors.forEach((error) => console.error(`  - ${error}`));

      throw new Error(
        `Environment validation failed:\n${errors.join('\n')}`
      );
    }

    console.log('✅ Frontend environment variables validated successfully');
    return result.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation error:', error.issues);
    }
    throw error;
  }
}

/**
 * Validate backend environment variables (server-side only)
 */
export function validateBackendEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('validateBackendEnv should only be called on the server');
  }

  try {
    const env = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      VITE_ADMIN_EMAILS: process.env.VITE_ADMIN_EMAILS,
      VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || '',
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      VITE_APP_VERSION: process.env.VITE_APP_VERSION,
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    };

    const result = backendEnvSchema.safeParse(env);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );

      console.error('❌ Backend environment validation failed:');
      errors.forEach((error) => console.error(`  - ${error}`));

      throw new Error(
        `Backend environment validation failed:\n${errors.join('\n')}`
      );
    }

    console.log('✅ Backend environment variables validated successfully');
    return result.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Backend environment validation error:', error.issues);
    }
    throw error;
  }
}

/**
 * Get a specific environment variable with type safety
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  const value = import.meta.env[key] || process.env[key];
  return value as Env[K];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return (
    import.meta.env.MODE === 'production' ||
    process.env.NODE_ENV === 'production'
  );
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return (
    import.meta.env.MODE === 'development' ||
    process.env.NODE_ENV === 'development'
  );
}
