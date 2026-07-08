const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: '.env.local' });

const FarmerSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  address: String,
  openingBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TransactionSchema = new mongoose.Schema({
  billNumber: { type: Number, unique: true },
  farmerId: mongoose.Schema.Types.ObjectId,
  partyName: String,
  productName: String,
  quantity: Number,
  rate: Number,
  amount: Number,
  commission: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  laborCharge: { type: Number, default: 0 },
  netPayable: Number,
  type: {
    type: String,
    enum: ['sale', 'purchase', 'expense', 'payment_in', 'payment_out'],
  },
  mode: { type: String, enum: ['cash', 'udhar'], default: 'cash' },
  status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  pdfUrl: String,
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  phone: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Farmer = mongoose.model('Farmer', FarmerSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const User = mongoose.model('User', UserSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await Farmer.deleteMany({});
    await Transaction.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users - Let the User model handle password hashing
    console.log('Creating users...');
    
    // We need to use the actual User model from the app, not the seed schema
    // For now, we'll hash once here since insertMany bypasses hooks
    const salt = await bcrypt.genSalt(10);
    
    const users = await User.insertMany([
      {
        name: 'Mandi Khata Admin',
        email: 'mandikhata01@gmail.com',
        password: await bcrypt.hash('mandikhata01@gmail.com', salt),
        role: 'admin',
        phone: '8878502349',
        isActive: true,
      },
      {
        name: 'Demo User',
        email: 'demo@mandi.com',
        password: await bcrypt.hash('demo123456', salt),
        role: 'user',
        phone: '9876543201',
        isActive: true,
      },
    ]);
    console.log('Created sample users:', users.length);

    // Create sample farmers
    const farmers = await Farmer.insertMany([
      {
        name: 'Raj Kumar Singh',
        phone: '9876543210',
        address: 'Village Nakoda, District Indore',
        openingBalance: 5000,
      },
      {
        name: 'Prem Prakash',
        phone: '9876543211',
        address: 'Village Pithapur, District Madhya Pradesh',
        openingBalance: -12000,
      },
      {
        name: 'Suresh Yadav',
        phone: '9876543212',
        address: 'Village Rajpur, District Indore',
        openingBalance: 8500,
      },
    ]);
    console.log('Created sample farmers:', farmers.length);

    // Create sample transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await Transaction.insertMany([
      // Sales
      {
        billNumber: 1001,
        farmerId: farmers[0]._id,
        partyName: 'Retail Shop A',
        productName: 'Tomato',
        quantity: 500,
        rate: 35,
        amount: 17500,
        commission: 2.5,
        tax: 5,
        laborCharge: 500,
        netPayable: 16362.5,
        type: 'sale',
        mode: 'cash',
        status: 'paid',
        date: today,
        createdAt: today,
      },
      {
        billNumber: 1002,
        farmerId: farmers[1]._id,
        partyName: 'Wholesale Buyer B',
        productName: 'Potato',
        quantity: 1000,
        rate: 28,
        amount: 28000,
        commission: 3,
        tax: 5,
        laborCharge: 800,
        netPayable: 26170,
        type: 'sale',
        mode: 'udhar',
        status: 'pending',
        date: today,
        createdAt: today,
      },
      // Purchase
      {
        billNumber: 1003,
        partyName: 'Farm Supplier C',
        productName: 'Onion',
        quantity: 800,
        rate: 32,
        amount: 25600,
        commission: 2,
        tax: 5,
        laborCharge: 600,
        netPayable: 24518,
        type: 'purchase',
        mode: 'cash',
        status: 'paid',
        date: today,
        createdAt: today,
      },
      // Expense
      {
        billNumber: 1004,
        partyName: 'Mandi Labor',
        productName: 'Daily Labor Charges',
        quantity: 1,
        rate: 3000,
        amount: 3000,
        commission: 0,
        tax: 0,
        laborCharge: 0,
        netPayable: 3000,
        type: 'expense',
        mode: 'cash',
        status: 'paid',
        date: today,
        createdAt: today,
      },
      // Payment In
      {
        billNumber: 1005,
        partyName: 'Previous Udhar Settlement',
        productName: 'Payment Received',
        quantity: 1,
        rate: 50000,
        amount: 50000,
        commission: 0,
        tax: 0,
        laborCharge: 0,
        netPayable: 50000,
        type: 'payment_in',
        mode: 'cash',
        status: 'paid',
        date: today,
        createdAt: today,
      },
      // Payment Out
      {
        billNumber: 1006,
        partyName: 'Transport Service',
        productName: 'Transport Payment',
        quantity: 1,
        rate: 8000,
        amount: 8000,
        commission: 0,
        tax: 0,
        laborCharge: 0,
        netPayable: 8000,
        type: 'payment_out',
        mode: 'cash',
        status: 'paid',
        date: today,
        createdAt: today,
      },
    ]);
    console.log('Created sample transactions:', transactions.length);

    console.log('Seed completed successfully!');
    console.log('\n--- Demo Credentials ---');
    console.log('Admin Dashboard:');
    console.log('  Email: mandikhata01@gmail.com');
    console.log('  Password: mandikhata01@gmail.com');
    console.log('\nUser Dashboard:');
    console.log('  Email: demo@mandi.com');
    console.log('  Password: demo123456');
    console.log('-------------------------\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
