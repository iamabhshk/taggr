import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'CREATE_LABEL' | 'UPDATE_LABEL' | 'DELETE_LABEL' | 'PUBLISH_LABEL';
  labelId?: mongoose.Types.ObjectId;
  changes: {
    before: any;
    after: any;
  };
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['CREATE_LABEL', 'UPDATE_LABEL', 'DELETE_LABEL', 'PUBLISH_LABEL'],
      required: true,
    },
    labelId: {
      type: Schema.Types.ObjectId,
      ref: 'Label',
    },
    changes: {
      before: {
        type: Schema.Types.Mixed,
        default: {},
      },
      after: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: false,
    collection: 'auditLogs',
  }
);

// Indexes
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ labelId: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
