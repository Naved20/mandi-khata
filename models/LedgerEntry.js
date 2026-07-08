import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Please provide customer ID'],
    },
    transactionType: {
      type: String,
      enum: ['udhar_inventory', 'udhar_cash', 'jama_cash', 'jama_upi', 'jama_bank', 'jama_cheque'],
      required: [true, 'Please provide transaction type'],
    },
    particular: {
      type: String,
      required: [true, 'Please provide particular/description'],
      trim: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    runningBalance: {
      type: Number,
      required: true,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
    },
    quantity: {
      type: Number,
    },
    unit: {
      type: String,
    },
    rate: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'cheque', 'none'],
      default: 'cash',
    },
    notes: {
      type: String,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  { timestamps: true }
);

// Index for faster queries
ledgerEntrySchema.index({ customerId: 1, date: -1 });
ledgerEntrySchema.index({ date: -1 });

export default mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', ledgerEntrySchema);
