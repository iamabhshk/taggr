import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
  userId: mongoose.Types.ObjectId;
  key: string;
  name: string;
  scopes: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    scopes: {
      type: [String],
      default: ['read:labels', 'publish:labels'],
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'api_keys',
  }
);

// Indexes
ApiKeySchema.index({ key: 1 }, { unique: true });
ApiKeySchema.index({ userId: 1, isActive: 1 });
ApiKeySchema.index({ expiresAt: 1 }, { sparse: true });

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
