import mongoose, { Schema, Document } from 'mongoose';

export interface IVersionEntry {
  version: string;
  value: string;
  changelog: string;
  publishedAt: Date;
}

export interface ILabel extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  name: string;
  displayName: string;
  value: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  isPublished: boolean;
  isPrivate: boolean;
  packageName: string;
  npmPackageId?: string;
  metadata: {
    downloads: number;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  versions: IVersionEntry[];
}

const VersionEntrySchema: Schema = new Schema({
  version: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  changelog: {
    type: String,
    default: '',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
});

const LabelSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
      lowercase: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    packageName: {
      type: String,
      required: true,
      unique: true,
    },
    npmPackageId: {
      type: String,
      default: '',
    },
    metadata: {
      downloads: {
        type: Number,
        default: 0,
      },
      usageCount: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    versions: {
      type: [VersionEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'labels',
  }
);

// Compound indexes
LabelSchema.index({ userId: 1, name: 1 }, { unique: true });
LabelSchema.index({ userId: 1, tags: 1 });
LabelSchema.index({ workspaceId: 1, name: 1 });
// packageName unique index is already created by unique: true in schema
LabelSchema.index({ createdAt: -1 });
LabelSchema.index({ 'metadata.downloads': -1 });

// Pre-save middleware to update metadata.updatedAt
LabelSchema.pre<ILabel>('save', function (next) {
  this.metadata.updatedAt = new Date();
  next();
});

export default mongoose.model<ILabel>('Label', LabelSchema);
