import { ApiResponse } from '../types/index.js';

export const createSuccessResponse = <T>(data: T, meta?: any): ApiResponse<T> => {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
};

export const createErrorResponse = (
  code: string,
  message: string,
  statusCode: number,
  details?: any
): ApiResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      details,
    },
  };
};

export const generatePackageName = (userId: string, labelName: string): string => {
  return `@${userId}/${labelName}`;
};

export const incrementVersion = (
  currentVersion: string,
  bump: 'major' | 'minor' | 'patch' = 'patch'
): string => {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
};

export const sanitizeUserInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const kebabCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};
