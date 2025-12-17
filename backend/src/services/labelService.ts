import Label, { ILabel } from '../models/Label.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import { generatePackageName, incrementVersion } from '../utils/helpers.js';
import { SearchParams } from '../types/index.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

export class LabelService {
  async createLabel(
    userId: string,
    data: {
      name: string;
      displayName: string;
      value: string;
      description?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<ILabel> {
    // Find user
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if label with same name already exists
    const existing = await Label.findOne({ userId: user._id, name: data.name });
    if (existing) {
      throw new ConflictError('Label with this name already exists');
    }

    // Generate package name
    const packageName = generatePackageName(userId, data.name);

    // Create label
    const label = await Label.create({
      userId: user._id,
      ...data,
      packageName,
      version: '1.0.0',
      versions: [
        {
          version: '1.0.0',
          value: data.value,
          changelog: 'Initial release',
          publishedAt: new Date(),
        },
      ],
    });

    // Update user stats
    user.stats.totalLabels += 1;
    await user.save();

    // Create audit log
    await AuditLog.create({
      userId: user._id,
      action: 'CREATE_LABEL',
      labelId: label._id,
      changes: {
        before: {},
        after: label.toObject(),
      },
    });

    return label;
  }

  async getLabels(userId: string, params: SearchParams): Promise<{
    labels: ILabel[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const { page = 1, limit = 20, query, category, tags, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Build query
    const filter: any = { userId: user._id };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Execute query
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [labels, total] = await Promise.all([
      Label.find(filter).sort(sort).skip(skip).limit(limit),
      Label.countDocuments(filter),
    ]);

    return {
      labels,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLabelById(userId: string, labelId: string): Promise<ILabel> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const label = await Label.findOne({ _id: labelId, userId: user._id });
    if (!label) {
      throw new NotFoundError('Label');
    }

    return label;
  }

  async updateLabel(
    userId: string,
    labelId: string,
    data: Partial<{
      displayName: string;
      value: string;
      description: string;
      category: string;
      tags: string[];
    }>
  ): Promise<ILabel> {
    const label = await this.getLabelById(userId, labelId);
    const before = label.toObject();

    // Update fields
    Object.assign(label, data);
    await label.save();

    // Create audit log
    const user = await User.findOne({ uid: userId });
    await AuditLog.create({
      userId: user!._id,
      action: 'UPDATE_LABEL',
      labelId: label._id,
      changes: {
        before,
        after: label.toObject(),
      },
    });

    return label;
  }

  async deleteLabel(userId: string, labelId: string): Promise<void> {
    const label = await this.getLabelById(userId, labelId);
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    // Create audit log before deletion
    await AuditLog.create({
      userId: user._id,
      action: 'DELETE_LABEL',
      labelId: label._id,
      changes: {
        before: label.toObject(),
        after: {},
      },
    });

    await label.deleteOne();

    // Update user stats
    user.stats.totalLabels = Math.max(0, user.stats.totalLabels - 1);
    await user.save();
  }

  async publishLabel(
    userId: string,
    labelId: string,
    changelog?: string,
    versionBump: 'major' | 'minor' | 'patch' = 'patch'
  ): Promise<ILabel> {
    const label = await this.getLabelById(userId, labelId);

    // Increment version
    const newVersion = incrementVersion(label.version, versionBump);
    label.version = newVersion;
    label.isPublished = true;

    // Add version to history
    label.versions.push({
      version: newVersion,
      value: label.value,
      changelog: changelog || `Version ${newVersion}`,
      publishedAt: new Date(),
    });

    await label.save();

    // Publish to npm
    const { NpmService } = await import('./npmService.js');
    const npmService = new NpmService();
    const npmResult = await npmService.publishToNpm(label, userId);
    
    if (npmResult.success && npmResult.packageId) {
      label.npmPackageId = npmResult.packageId;
      await label.save();
    } else {
      // Log error but don't fail the publish - label is still published in our system
      logger.warn(`Failed to publish ${label.packageName} to npm: ${npmResult.error}`);
    }

    // Create audit log
    const user = await User.findOne({ uid: userId });
    await AuditLog.create({
      userId: user!._id,
      action: 'PUBLISH_LABEL',
      labelId: label._id,
      changes: {
        before: { version: label.versions[label.versions.length - 2]?.version },
        after: { version: newVersion },
      },
    });

    return label;
  }

  async getVersionHistory(userId: string, labelId: string) {
    const label = await this.getLabelById(userId, labelId);
    return label.versions.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getLabelStats(userId: string) {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get current month date range
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = currentMonthStart;

    // Current stats
    const [
      totalLabels,
      publishedLabels,
      totalDownloads,
      totalUsage,
      currentMonthLabels,
      lastMonthLabels,
    ] = await Promise.all([
      // Total label count
      Label.countDocuments({ userId: user._id }),

      // Published labels count
      Label.countDocuments({ userId: user._id, isPublished: true }),

      // Total downloads across all labels
      Label.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$metadata.downloads' } } },
      ]),

      // Total usage count across all labels
      Label.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$metadata.usageCount' } } },
      ]),

      // Labels created this month
      Label.countDocuments({
        userId: user._id,
        'metadata.createdAt': { $gte: currentMonthStart }
      }),

      // Labels created last month
      Label.countDocuments({
        userId: user._id,
        'metadata.createdAt': { $gte: lastMonthStart, $lt: lastMonthEnd }
      }),
    ]);

    // Calculate average usage per label
    const averageUsage = totalLabels > 0
      ? Math.round((totalUsage[0]?.total || 0) / totalLabels)
      : 0;

    // Calculate month-over-month growth percentage
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const labelGrowth = calculateGrowth(currentMonthLabels, lastMonthLabels);

    return {
      totalLabels,
      publishedLabels,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalUsage: totalUsage[0]?.total || 0,
      averageUsage,
      growth: {
        labels: labelGrowth,
        usage: 0,
        averageUsage: 0,
        published: 0,
      }
    };
  }

  async exportLabels(userId: string): Promise<ILabel[]> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    return Label.find({ userId: user._id });
  }

  async importLabels(userId: string, labels: any[]): Promise<{ imported: number; failed: number }> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    let imported = 0;
    let failed = 0;

    for (const labelData of labels) {
      try {
        await this.createLabel(userId, labelData);
        imported++;
      } catch (error) {
        failed++;
      }
    }

    return { imported, failed };
  }
}

export default new LabelService();
