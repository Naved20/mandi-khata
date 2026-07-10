import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a farmer name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);
