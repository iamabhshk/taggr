import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LabelController } from './labelController.js';
import { createMockUser, createMockLabel } from '../__tests__/helpers.js';
import labelService from '../services/labelService.js';

// Mock the label service
jest.mock('../services/labelService.js', () => ({
  default: {
    getLabels: jest.fn(),
    getLabel: jest.fn(),
    createLabel: jest.fn(),
    updateLabel: jest.fn(),
    deleteLabel: jest.fn(),
  },
}));

describe('LabelController', () => {
  let controller: LabelController;
  let mockUser: any;

  beforeEach(async () => {
    controller = new LabelController();
    mockUser = await createMockUser();
    jest.clearAllMocks();
  });

  describe('getLabels', () => {
    it('should return labels for authenticated user', async () => {
      const mockLabels = {
        labels: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      (labelService.getLabels as any).mockResolvedValue(mockLabels);

      const req = {
        user: { uid: mockUser.uid },
        query: {},
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await controller.getLabels(req, res, next);

      expect(labelService.getLabels).toHaveBeenCalledWith(mockUser.uid, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('createLabel', () => {
    it('should create a new label', async () => {
      const mockLabel = await createMockLabel(mockUser._id.toString());
      (labelService.createLabel as any).mockResolvedValue(mockLabel);

      const req = {
        user: { uid: mockUser.uid },
        body: {
          name: 'test-label',
          displayName: 'Test Label',
          value: 'Test Value',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const next = jest.fn();

      await controller.createLabel(req, res, next);

      expect(labelService.createLabel).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

