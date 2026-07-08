const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('===== MongoDB Connection Test =====\n');

  try {
    console.log('Testing MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected successfully!\n');

    // Get database info
    const admin = mongoose.connection.db.admin();
    const stats = await admin.serverStatus();
    
    console.log('Server Info:');
    console.log(`  - Version: ${stats.version}`);
    console.log(`  - Uptime: ${stats.uptime} seconds`);
    console.log(`  - Connections: ${stats.connections.current}`);
    console.log(`  - Operations: ${stats.opcounters.insert + stats.opcounters.query + stats.opcounters.update + stats.opcounters.delete}`);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Test Farmer model
    console.log('\nTesting Farmer Model:');
    const FarmerSchema = new mongoose.Schema({
      name: String,
      phone: { type: String, unique: true },
      address: String,
      openingBalance: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
    });
    const Farmer = mongoose.model('TestFarmer', FarmerSchema, 'farmers');
    const farmerCount = await Farmer.countDocuments();
    console.log(`  - Farmers in database: ${farmerCount}`);

    if (farmerCount > 0) {
      const sample = await Farmer.findOne();
      console.log(`  - Sample farmer: ${sample.name} (${sample.phone})`);
    }

    // Test Transaction model
    console.log('\nTesting Transaction Model:');
    const TransactionSchema = new mongoose.Schema({
      billNumber: Number,
      productName: String,
      quantity: Number,
      rate: Number,
      netPayable: Number,
      type: String,
      mode: String,
      createdAt: Date,
    });
    const Transaction = mongoose.model('TestTransaction', TransactionSchema, 'transactions');
    const transactionCount = await Transaction.countDocuments();
    console.log(`  - Transactions in database: ${transactionCount}`);

    if (transactionCount > 0) {
      const stats = await Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            total: { $sum: '$netPayable' },
          },
        },
      ]);
      console.log('\n  Transaction Summary:');
      stats.forEach(stat => {
        console.log(`    - ${stat._id}: ${stat.count} transactions, Total: ₹${stat.total}`);
      });
    }

    console.log('\n===== Connection Test PASSED =====');
    
  } catch (error) {
    console.error('\n===== Connection Test FAILED =====');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\nTroubleshooting:');
      console.error('1. Check your internet connection');
      console.error('2. Verify MongoDB URI is correct');
      console.error('3. Check IP whitelist in MongoDB Atlas');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('\nTroubleshooting:');
      console.error('1. Check username and password in MongoDB URI');
      console.error('2. Verify database user exists in MongoDB Atlas');
      console.error('3. Check special characters in password are URL-encoded');
    }

    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

testConnection();
