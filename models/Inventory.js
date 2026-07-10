import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    notes: {
      type: String,
      trim: true,
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
inventorySchema.index({ userId: 1, itemName: 1 });

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
