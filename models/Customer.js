import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please provide mobile number'],
      unique: true,
    },
    village: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    aadhaar: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    customerType: {
      type: String,
      enum: ['farmer', 'trader', 'buyer', 'supplier', 'commission_agent'],
      default: 'farmer',
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
    openingBalance: {
      type: Number,
      default: 0,
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
customerSchema.index({ mobileNumber: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ createdAt: -1 });

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
