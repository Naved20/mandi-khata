import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
    },
    currentStock: {
      type: Number,
      required: [true, 'Please provide current stock'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please provide unit'],
      enum: ['quintal', 'kg', 'liter', 'piece', 'bag', 'box'],
      default: 'quintal',
    },
    buyingPrice: {
      type: Number,
      required: [true, 'Please provide buying price'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide selling price'],
    },
    reorderLevel: {
      type: Number,
      default: 0,
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
inventorySchema.index({ itemName: 1 });
inventorySchema.index({ category: 1 });

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
