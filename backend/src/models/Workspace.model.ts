import mongoose, { Schema, Document } from 'mongoose';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  joinedAt: Date;
  invitedBy?: mongoose.Types.ObjectId;
}

export interface IWorkspaceInvite {
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  ownerId: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  pendingInvites: IWorkspaceInvite[];
  settings: {
    defaultRole: WorkspaceRole;
    allowMemberInvites: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const WorkspaceInviteSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WorkspaceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: '',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [WorkspaceMemberSchema],
      default: [],
    },
    pendingInvites: {
      type: [WorkspaceInviteSchema],
      default: [],
    },
    settings: {
      defaultRole: {
        type: String,
        enum: ['admin', 'editor', 'viewer'],
        default: 'editor',
      },
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    collection: 'workspaces',
  }
);

// Indexes
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.userId': 1 });
WorkspaceSchema.index({ 'pendingInvites.email': 1 });
WorkspaceSchema.index({ 'pendingInvites.token': 1 });

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

