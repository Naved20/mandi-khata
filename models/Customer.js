import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please provide mobile number'],
      index: true,
    },
    village: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    totalUdhar: {
      type: Number,
      default: 0,
    },
    totalJama: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    lastTransactionDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
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
customerSchema.index({ userId: 1, name: 1 });
customerSchema.index({ userId: 1, mobileNumber: 1 }, { unique: true }); // Unique per user
customerSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
