import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    billNumber: {
      type: Number,
      unique: true,
      required: [true, 'Bill number is required'],
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    partyName: {
      type: String,
      trim: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    commission: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    laborCharge: {
      type: Number,
      default: 0,
    },
    netPayable: {
      type: Number,
      required: [true, 'Net payable amount is required'],
    },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'expense', 'payment_in', 'payment_out'],
      required: [true, 'Transaction type is required'],
    },
    mode: {
      type: String,
      enum: ['cash', 'udhar'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial'],
      default: 'pending',
    },
    pdfUrl: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
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

// Auto-increment billNumber
transactionSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const lastTransaction = await this.constructor
        .findOne({})
        .sort({ billNumber: -1 })
        .select('billNumber');

      if (lastTransaction && lastTransaction.billNumber) {
        this.billNumber = lastTransaction.billNumber + 1;
      } else {
        this.billNumber = 1001;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
