import { z } from 'zod';
import { LABEL_NAME_REGEX, SEMVER_REGEX } from '../config/constants.js';

// Label validation schemas
export const createLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(LABEL_NAME_REGEX, 'Name must be in kebab-case (lowercase, hyphens only)'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  value: z
    .string()
    .min(1, 'Value is required')
    .max(5000, 'Value must be less than 5000 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
});

export const updateLabelSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
  value: z
    .string()
    .min(1, 'Value is required')
    .max(5000, 'Value must be less than 5000 characters')
    .optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
});

export const publishLabelSchema = z.object({
  changelog: z.string().max(500).optional(),
  versionBump: z.enum(['major', 'minor', 'patch']).optional().default('patch'),
});

// User validation schemas
export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .optional(),
  avatar: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        // Allow URLs
        if (val.startsWith('http://') || val.startsWith('https://')) return true;
        // Allow data URLs (base64 images)
        if (val.startsWith('data:image/')) return true;
        return false;
      },
      { message: 'Avatar must be a valid URL or base64 data URL' }
    )
    .optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark']).optional(),
      notifications: z.boolean().optional(),
      publicProfile: z.boolean().optional(),
    })
    .optional(),
});

// Search and filter schemas
export const searchLabelsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'downloads']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Helper functions
export const validateSemVer = (version: string): boolean => {
  return SEMVER_REGEX.test(version);
};

export const validateLabelName = (name: string): boolean => {
  return LABEL_NAME_REGEX.test(name);
};
