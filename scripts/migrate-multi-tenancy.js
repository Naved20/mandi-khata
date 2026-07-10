// Migration script for Multi-Tenancy
// This script assigns existing data to the first admin user

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const Customer = require('../models/Customer').default;
const Inventory = require('../models/Inventory').default;
const LedgerEntry = require('../models/LedgerEntry').default;
const PriceHistory = require('../models/PriceHistory').default;
const User = require('../models/User').default;

async function migrate() {
  try {
    console.log('🔄 Starting Multi-Tenancy Migration...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find first admin user
    console.log('👤 Finding first admin user...');
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ No admin user found! Please create an admin user first.');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);
    console.log(`   User ID: ${adminUser._id}\n`);

    const userId = adminUser._id;

    // Migrate Customers
    console.log('📋 Migrating Customers...');
    const customersWithoutUser = await Customer.countDocuments({ userId: { $exists: false } });
    console.log(`   Found ${customersWithoutUser} customers without userId`);
    
    if (customersWithoutUser > 0) {
      const customerResult = await Customer.updateMany(
        { userId: { $exists: false } },
        { $set: { userId } }
      );
      console.log(`✅ Updated ${customerResult.modifiedCount} customers\n`);
    } else {
      console.log('✅ No customers to migrate\n');
    }

    // Migrate Inventory
    console.log('📦 Migrating Inventory...');
    const inventoryWithoutUser = await Inventory.countDocuments({ userId: { $exists: false } });
    console.log(`   Found ${inventoryWithoutUser} inventory items without userId`);
    
    if (inventoryWithoutUser > 0) {
      const inventoryResult = await Inventory.updateMany(
        { userId: { $exists: false } },
        { $set: { userId } }
      );
      console.log(`✅ Updated ${inventoryResult.modifiedCount} inventory items\n`);
    } else {
      console.log('✅ No inventory items to migrate\n');
    }

    // Migrate Ledger Entries
    console.log('📝 Migrating Ledger Entries...');
    const ledgerWithoutUser = await LedgerEntry.countDocuments({ userId: { $exists: false } });
    console.log(`   Found ${ledgerWithoutUser} ledger entries without userId`);
    
    if (ledgerWithoutUser > 0) {
      const ledgerResult = await LedgerEntry.updateMany(
        { userId: { $exists: false } },
        { $set: { userId } }
      );
      console.log(`✅ Updated ${ledgerResult.modifiedCount} ledger entries\n`);
    } else {
      console.log('✅ No ledger entries to migrate\n');
    }

    // Migrate Price History
    console.log('💰 Migrating Price History...');
    const priceHistoryWithoutUser = await PriceHistory.countDocuments({ userId: { $exists: false } });
    console.log(`   Found ${priceHistoryWithoutUser} price history records without userId`);
    
    if (priceHistoryWithoutUser > 0) {
      const priceResult = await PriceHistory.updateMany(
        { userId: { $exists: false } },
        { $set: { userId } }
      );
      console.log(`✅ Updated ${priceResult.modifiedCount} price history records\n`);
    } else {
      console.log('✅ No price history to migrate\n');
    }

    // Verify Migration
    console.log('\n🔍 Verifying Migration...');
    const customerCheck = await Customer.countDocuments({ userId: { $exists: false } });
    const inventoryCheck = await Inventory.countDocuments({ userId: { $exists: false } });
    const ledgerCheck = await LedgerEntry.countDocuments({ userId: { $exists: false } });
    const priceCheck = await PriceHistory.countDocuments({ userId: { $exists: false } });

    console.log(`   Customers without userId: ${customerCheck}`);
    console.log(`   Inventory without userId: ${inventoryCheck}`);
    console.log(`   Ledger Entries without userId: ${ledgerCheck}`);
    console.log(`   Price History without userId: ${priceCheck}`);

    if (customerCheck === 0 && inventoryCheck === 0 && ledgerCheck === 0 && priceCheck === 0) {
      console.log('\n✅ ✅ ✅ Migration Successful! All data now has userId ✅ ✅ ✅\n');
    } else {
      console.log('\n⚠️  Warning: Some records still missing userId\n');
    }

    // Show Summary
    console.log('📊 Migration Summary:');
    console.log(`   Total Customers: ${await Customer.countDocuments({ userId })}`);
    console.log(`   Total Inventory: ${await Inventory.countDocuments({ userId })}`);
    console.log(`   Total Transactions: ${await LedgerEntry.countDocuments({ userId })}`);
    console.log(`   Total Price History: ${await PriceHistory.countDocuments({ userId })}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('   All existing data is now assigned to:', adminUser.email);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
}

// Run migration
migrate();
