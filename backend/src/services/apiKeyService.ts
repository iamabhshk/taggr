import ApiKey, { IApiKey } from '../models/ApiKey.model.js';
import User from '../models/User.model.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

export class ApiKeyService {
  /**
   * Generate a secure API key
   */
  private generateSecureKey(): string {
    const prefix = 'taggr';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomBytes}`;
  }

  /**
   * Get MongoDB user ID from Firebase UID
   */
  private async getUserId(uid: string): Promise<string> {
    const user = await User.findOne({ uid });
    if (!user) {
      throw new Error('User not found');
    }
    return user._id.toString();
  }

  /**
   * Generate a new API key for a user
   */
  async generateApiKey(uid: string, name: string, scopes?: string[]): Promise<IApiKey> {
    try {
      const userId = await this.getUserId(uid);

      // Check if key with same name already exists for this user
      const existingKey = await ApiKey.findOne({ userId, name: name.trim(), isActive: true });
      if (existingKey) {
        throw new Error('An API key with this name already exists');
      }

      const key = this.generateSecureKey();

      const apiKey = await ApiKey.create({
        userId,
        key,
        name: name.trim(),
        scopes: scopes || ['read:labels', 'publish:labels'],
        isActive: true,
      });

      logger.info(`Generated API key for user ${uid}: ${apiKey.name}`);
      return apiKey;
    } catch (error) {
      logger.error('Error generating API key:', error);
      throw error;
    }
  }

  /**
   * List all API keys for a user
   */
  async listUserApiKeys(uid: string): Promise<IApiKey[]> {
    try {
      const userId = await this.getUserId(uid);
      const apiKeys = await ApiKey.find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .select('-__v');

      return apiKeys;
    } catch (error) {
      logger.error('Error listing API keys:', error);
      throw error;
    }
  }

  /**
   * Revoke (deactivate) an API key
   */
  async revokeApiKey(uid: string, keyId: string): Promise<void> {
    try {
      const userId = await this.getUserId(uid);
      const result = await ApiKey.findOneAndUpdate(
        { _id: keyId, userId },
        { isActive: false },
        { new: true }
      );

      if (!result) {
        throw new Error('API key not found or unauthorized');
      }

      logger.info(`Revoked API key ${keyId} for user ${uid}`);
    } catch (error) {
      logger.error('Error revoking API key:', error);
      throw error;
    }
  }

  /**
   * Validate an API key and update last used timestamp
   */
  async validateApiKey(key: string): Promise<IApiKey | null> {
    try {
      const apiKey = await ApiKey.findOne({ key, isActive: true });

      if (!apiKey) {
        return null;
      }

      // Check if expired
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        await ApiKey.findByIdAndUpdate(apiKey._id, { isActive: false });
        return null;
      }

      // Update last used timestamp
      await ApiKey.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() });

      return apiKey;
    } catch (error) {
      logger.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Get API key by ID
   */
  async getApiKeyById(keyId: string, userId: string): Promise<IApiKey | null> {
    try {
      const apiKey = await ApiKey.findOne({ _id: keyId, userId });
      return apiKey;
    } catch (error) {
      logger.error('Error getting API key:', error);
      throw error;
    }
  }

  /**
   * Regenerate an API key (keeps same name, generates new key value)
   */
  async regenerateApiKey(uid: string, keyId: string): Promise<IApiKey> {
    try {
      const userId = await this.getUserId(uid);
      const existingKey = await ApiKey.findOne({ _id: keyId, userId, isActive: true });

      if (!existingKey) {
        throw new Error('API key not found or already revoked');
      }

      const newKey = this.generateSecureKey();
      existingKey.key = newKey;
      await existingKey.save();

      logger.info(`Regenerated API key ${keyId} for user ${uid}`);
      return existingKey;
    } catch (error) {
      logger.error('Error regenerating API key:', error);
      throw error;
    }
  }
}

export default new ApiKeyService();
