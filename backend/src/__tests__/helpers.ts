import { Request } from 'express';
import User from '../models/User.model.js';
import Label from '../models/Label.model.js';
import type { IUser } from '../models/User.model.js';
import type { ILabel } from '../models/Label.model.js';

/**
 * Create a mock user for testing
 */
export const createMockUser = async (overrides?: Partial<IUser>): Promise<IUser> => {
  return User.create({
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    stats: {
      totalLabels: 0,
      totalDownloads: 0,
      lastActiveAt: new Date(),
    },
    ...overrides,
  });
};

/**
 * Create a mock label for testing
 */
export const createMockLabel = async (
  userId: string,
  overrides?: Partial<ILabel>
): Promise<ILabel> => {
  return Label.create({
    userId: userId as any,
    name: 'test-label',
    displayName: 'Test Label',
    value: 'Test Value',
    packageName: '@test/test-label',
    version: '1.0.0',
    versions: [
      {
        version: '1.0.0',
        value: 'Test Value',
        changelog: 'Initial release',
        publishedAt: new Date(),
      },
    ],
    ...overrides,
  });
};

/**
 * Create a mock Express request with user
 */
export const createMockRequest = (user?: { uid: string; email: string }): Partial<Request> => {
  return {
    user: user || { uid: 'test-uid-123', email: 'test@example.com' },
    body: {},
    params: {},
    query: {},
    headers: {},
  } as Partial<Request>;
};

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

