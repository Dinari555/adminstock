import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "L'action est requise"],
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'STOCK_IN',
        'STOCK_OUT',
        'INVOICE_CREATE',
        'INVOICE_UPDATE',
        'INVOICE_DELETE',
      ],
    },
    entity: {
      type: String,
      required: [true, "L'entité est requise"],
      enum: ['User', 'Client', 'Product', 'Invoice', 'StockOperation', 'Auth'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ userId: 1, date: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ date: -1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;


