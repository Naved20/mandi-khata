import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    changedBy: {
      type: String,
      default: 'Admin',
    },
    changeType: {
      type: String,
      enum: ['created', 'updated'],
      default: 'updated',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
priceHistorySchema.index({ userId: 1, inventoryItemId: 1, createdAt: -1 });

export default mongoose.models.PriceHistory || mongoose.model('PriceHistory', priceHistorySchema);
