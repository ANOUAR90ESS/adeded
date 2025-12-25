import { z } from 'zod';

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Payment validation schemas
export const createCheckoutSchema = z.object({
  plan: z.enum(['starter', 'pro'], {
    errorMap: () => ({ message: 'Invalid plan selected' }),
  }),
  userId: z.string().uuid('Invalid user ID'),
});

export const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  userId: z.string().uuid('Invalid user ID'),
});

// Content generation validation schemas
export const generateContentSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters')
    .max(5000, 'Prompt must not exceed 5000 characters'),
  type: z.enum(['tool', 'news', 'course', 'tutorial', 'slides', 'image', 'video'], {
    errorMap: () => ({ message: 'Invalid content type' }),
  }),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(5, 'Image prompt must be at least 5 characters')
    .max(1000, 'Image prompt must not exceed 1000 characters'),
  numberOfImages: z.number().int().min(1).max(4).optional().default(1),
});

export const generateVideoSchema = z.object({
  prompt: z.string().min(10, 'Video prompt must be at least 10 characters')
    .max(500, 'Video prompt must not exceed 500 characters'),
});

export const transcribeAudioSchema = z.object({
  audioData: z.string().min(1, 'Audio data is required'),
  mimeType: z.string().regex(/^audio\//, 'Invalid audio MIME type'),
});

export const generateSpeechSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text must not exceed 5000 characters'),
  voice: z.enum(['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede']).optional(),
});

// Tool management validation schemas
export const createToolSchema = z.object({
  name: z.string().min(2, 'Tool name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  category: z.string().min(2, 'Category is required'),
  price: z.string().min(1, 'Price is required'),
  website: z.string().url('Invalid website URL'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

export const updateToolSchema = createToolSchema.partial().extend({
  id: z.string().uuid('Invalid tool ID'),
});

export const deleteToolSchema = z.object({
  id: z.string().uuid('Invalid tool ID'),
});

// News management validation schemas
export const createNewsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  category: z.string().min(2, 'Category is required'),
  source: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  date: z.string().optional(),
});

export const updateNewsSchema = createNewsSchema.partial().extend({
  id: z.string().uuid('Invalid news ID'),
});

export const deleteNewsSchema = z.object({
  id: z.string().uuid('Invalid news ID'),
});

// RSS feed validation schema
export const rssFeedSchema = z.object({
  url: z.string().url('Invalid RSS feed URL'),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(200),
  category: z.string().optional(),
});

// Helper type exports
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type GenerateImageInput = z.infer<typeof generateImageSchema>;
export type GenerateVideoInput = z.infer<typeof generateVideoSchema>;
export type CreateToolInput = z.infer<typeof createToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
