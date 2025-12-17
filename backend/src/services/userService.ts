import User, { IUser } from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Label from '../models/Label.model.js';
import { NotFoundError } from '../utils/errors.js';

export class UserService {
  async createUser(data: {
    uid: string;
    email: string;
    displayName: string;
    avatar?: string;
  }): Promise<IUser> {
    const user = await User.create(data);
    return user;
  }

  async getUserByUid(uid: string): Promise<IUser | null> {
    return User.findOne({ uid });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async updateUser(
    uid: string,
    data: Partial<{
      displayName: string;
      username: string;
      avatar: string;
      preferences: {
        theme?: 'light' | 'dark';
        notifications?: boolean;
        publicProfile?: boolean;
      };
    }>
  ): Promise<IUser> {
    const user = await User.findOne({ uid });
    if (!user) {
      throw new NotFoundError('User');
    }

    if (data.preferences) {
      user.preferences = { ...user.preferences, ...data.preferences };
    }

    if (data.displayName) {
      user.displayName = data.displayName;
    }

    if (data.username !== undefined) {
      // Check if username is taken by another user
      if (data.username) {
        const existing = await User.findOne({ username: data.username.toLowerCase(), uid: { $ne: uid } });
        if (existing) {
          throw new Error('Username is already taken');
        }
        user.username = data.username.toLowerCase();
      } else {
        user.username = undefined;
      }
    }

    if (data.avatar !== undefined) {
      user.avatar = data.avatar;
    }

    await user.save();
    return user;
  }

  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const query: any = { username: username.toLowerCase() };
    if (currentUserId) {
      query.uid = { $ne: currentUserId };
    }
    const existing = await User.findOne(query);
    return !existing;
  }

  async deleteUser(uid: string): Promise<void> {
    const user = await User.findOne({ uid });
    if (!user) {
      throw new NotFoundError('User');
    }

    await user.deleteOne();
  }

  async getUserStats(uid: string) {
    const user = await User.findOne({ uid });
    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      totalLabels: user.stats.totalLabels,
      totalDownloads: user.stats.totalDownloads,
      lastActiveAt: user.stats.lastActiveAt,
      memberSince: user.createdAt,
    };
  }

  async findOrCreateUser(data: {
    uid: string;
    email: string;
    displayName: string;
    avatar?: string;
  }): Promise<IUser> {
    let user = await this.getUserByUid(data.uid);

    if (!user) {
      user = await this.createUser(data);
    }

    return user;
  }

  async getRecentActivity(uid: string, limit: number = 20) {
    const user = await User.findOne({ uid });
    if (!user) {
      throw new NotFoundError('User');
    }

    const activities = await AuditLog.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate({
        path: 'labelId',
        select: 'name displayName',
        model: Label,
      })
      .lean();

    return activities.map((activity: any) => {
      const label = activity.labelId;
      const labelName = label
        ? label.displayName || label.name || 'Unknown Label'
        : activity.changes?.after?.displayName || activity.changes?.after?.name || 'Deleted Label';

      return {
        id: activity._id.toString(),
        action: activity.action,
        labelId: label?._id?.toString(),
        labelName,
        timestamp: activity.timestamp,
      };
    });
  }
}

export default new UserService();
