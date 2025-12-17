import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  username?: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalLabels: number;
    totalDownloads: number;
    lastActiveAt: Date;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    publicProfile: boolean;
  };
}

const UserSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    stats: {
      totalLabels: {
        type: Number,
        default: 0,
      },
      totalDownloads: {
        type: Number,
        default: 0,
      },
      lastActiveAt: {
        type: Date,
        default: Date.now,
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      publicProfile: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// No need for separate indexes - unique: true already creates indexes

export default mongoose.model<IUser>('User', UserSchema);
