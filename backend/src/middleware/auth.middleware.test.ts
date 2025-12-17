import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth.middleware.js';
import { getAuth } from '../config/firebase.js';
import { UnauthorizedError } from '../utils/errors.js';
import User from '../models/User.model.js';
import { createMockUser } from '../__tests__/helpers.js';

// Mock Firebase
jest.mock('../config/firebase.js', () => ({
  getAuth: jest.fn(),
}));

describe('authenticate middleware', () => {
  let mockUser: any;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(async () => {
    mockUser = await createMockUser();
    req = {
      headers: {},
    };
    res = {};
    next = vi.fn();
  });

  it('should throw UnauthorizedError when no token is provided', async () => {
    req.headers = {};

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should throw UnauthorizedError when token format is invalid', async () => {
    req.headers = {
      authorization: 'InvalidToken',
    };

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should authenticate user with valid token', async () => {
    const mockVerifyIdToken = jest.fn().mockResolvedValue({
      uid: mockUser.uid,
    });

    (getAuth as any).mockReturnValue({
      verifyIdToken: mockVerifyIdToken,
    });

    req.headers = {
      authorization: 'Bearer valid-token',
    };

    await authenticate(req as Request, res as Response, next);

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(next).toHaveBeenCalledWith();
    expect((req as any).user).toBeDefined();
  });
});

