// lib/db-adapter.js - Unified Database Adapter
// Automatically uses MongoDB when available, falls back to IndexedDB when offline
import { connectDB } from './mongodb';

// MongoDB Models
import Customer from '@/models/Customer';
import Inventory from '@/models/Inventory';
import LedgerEntry from '@/models/LedgerEntry';
import Transaction from '@/models/Transaction';

// IndexedDB Repositories (server-side compatible wrappers needed)
// Note: These will be imported dynamically only on client-side

let isMongoDBAvailable = false;
let mongoDBCheckTimestamp = 0;
const MONGO_CHECK_INTERVAL = 30000; // Re-check every 30 seconds

/**
 * Check if MongoDB is available
 * Caches result for 30 seconds to avoid repeated connection attempts
 */
async function checkMongoDBConnection() {
  const now = Date.now();
  
  // Use cached result if recent
  if (now - mongoDBCheckTimestamp < MONGO_CHECK_INTERVAL) {
    return isMongoDBAvailable;
  }

  try {
    const connection = await connectDB();
    isMongoDBAvailable = !!connection;
    mongoDBCheckTimestamp = now;
    
    if (isMongoDBAvailable) {
      console.log('✅ MongoDB available - using cloud database');
    } else {
      console.log('⚠️  MongoDB unavailable - using IndexedDB fallback');
    }
    
    return isMongoDBAvailable;
  } catch (error) {
    console.warn('⚠️  MongoDB connection check failed:', error.message);
    isMongoDBAvailable = false;
    mongoDBCheckTimestamp = now;
    return false;
  }
}

/**
 * Convert MongoDB document to plain object
 */
function toPlainObject(doc) {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map(d => toPlainObject(d));
  }
  if (doc.toObject) {
    return doc.toObject();
  }
  return doc;
}

/**
 * Convert MongoDB _id to string id for IndexedDB compatibility
 */
function normalizeDocument(doc) {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map(d => normalizeDocument(d));
  }
  
  const plain = toPlainObject(doc);
  if (plain._id) {
    plain.id = plain._id.toString();
  }
  return plain;
}

/**
 * CUSTOMERS ADAPTER
 */
export const CustomersAdapter = {
  /**
   * Find all customers for a user
   */
  async findAll(userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const customers = await Customer.find({ userId, isActive: true })
          .sort({ createdAt: -1 })
          .lean();
        return normalizeDocument(customers);
      } catch (error) {
        console.error('MongoDB query failed, falling back to IndexedDB:', error.message);
        isMongoDBAvailable = false; // Mark as unavailable
      }
    }
    
    // Fallback to IndexedDB - return empty array (client will use local data)
    // API routes in offline mode should return success with empty data
    // The client-side code will read from IndexedDB directly
    return [];
  },

  /**
   * Find one customer by ID
   */
  async findById(id, userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const customer = await Customer.findOne({ _id: id, userId }).lean();
        return normalizeDocument(customer);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return null;
  },

  /**
   * Find customer by mobile number
   */
  async findByMobile(userId, mobileNumber) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const customer = await Customer.findOne({ userId, mobileNumber }).lean();
        return normalizeDocument(customer);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return null;
  },

  /**
   * Create new customer
   */
  async create(customerData) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const customer = new Customer(customerData);
        await customer.save();
        return normalizeDocument(customer);
      } catch (error) {
        console.error('MongoDB create failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    // In offline mode, return success but let client handle via IndexedDB
    return {
      ...customerData,
      _id: `offline_${Date.now()}`,
      id: `offline_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      __offline: true,
    };
  },

  /**
   * Update customer
   */
  async update(id, userId, updates) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const customer = await Customer.findOneAndUpdate(
          { _id: id, userId },
          { ...updates, updatedAt: new Date() },
          { new: true }
        ).lean();
        return normalizeDocument(customer);
      } catch (error) {
        console.error('MongoDB update failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    // Offline mode - return success
    return { ...updates, id, __offline: true };
  },

  /**
   * Delete customer (soft delete)
   */
  async delete(id, userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        await Customer.findOneAndUpdate(
          { _id: id, userId },
          { isActive: false, updatedAt: new Date() }
        );
        return true;
      } catch (error) {
        console.error('MongoDB delete failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return true; // Offline mode - return success
  },
};

/**
 * INVENTORY ADAPTER
 */
export const InventoryAdapter = {
  /**
   * Find all inventory items for a user
   */
  async findAll(userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const inventory = await Inventory.find({ userId, isActive: true })
          .sort({ itemName: 1 })
          .lean();
        return normalizeDocument(inventory);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return [];
  },

  /**
   * Find one inventory item by ID
   */
  async findById(id, userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const item = await Inventory.findOne({ _id: id, userId }).lean();
        return normalizeDocument(item);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return null;
  },

  /**
   * Find inventory item by name
   */
  async findByName(userId, itemName) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const item = await Inventory.findOne({ userId, itemName }).lean();
        return normalizeDocument(item);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return null;
  },

  /**
   * Create new inventory item
   */
  async create(itemData) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const item = new Inventory(itemData);
        await item.save();
        return normalizeDocument(item);
      } catch (error) {
        console.error('MongoDB create failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return {
      ...itemData,
      _id: `offline_${Date.now()}`,
      id: `offline_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      __offline: true,
    };
  },

  /**
   * Update inventory item
   */
  async update(id, userId, updates) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const item = await Inventory.findOneAndUpdate(
          { _id: id, userId },
          { ...updates, updatedAt: new Date() },
          { new: true }
        ).lean();
        return normalizeDocument(item);
      } catch (error) {
        console.error('MongoDB update failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return { ...updates, id, __offline: true };
  },

  /**
   * Delete inventory item
   */
  async delete(id, userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        await Inventory.findOneAndUpdate(
          { _id: id, userId },
          { isActive: false, updatedAt: new Date() }
        );
        return true;
      } catch (error) {
        console.error('MongoDB delete failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return true;
  },
};

/**
 * TRANSACTIONS ADAPTER (LedgerEntry)
 */
export const TransactionsAdapter = {
  /**
   * Find all transactions for a user
   */
  async findAll(userId, customerId = null) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const query = { userId };
        if (customerId) query.customerId = customerId;
        
        const transactions = await LedgerEntry.find(query)
          .populate('customerId', 'name mobileNumber')
          .populate('inventoryItemId', 'itemName')
          .sort({ date: -1 })
          .lean();
        return normalizeDocument(transactions);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return [];
  },

  /**
   * Find ledger entries for a customer
   */
  async findByCustomer(customerId, userId) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const entries = await LedgerEntry.find({ customerId, userId })
          .sort({ date: -1 })
          .lean();
        return normalizeDocument(entries);
      } catch (error) {
        console.error('MongoDB query failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return [];
  },

  /**
   * Create new transaction
   */
  async create(transactionData) {
    const useMongo = await checkMongoDBConnection();
    
    if (useMongo) {
      try {
        const transaction = new LedgerEntry(transactionData);
        await transaction.save();
        
        // Update customer balance
        if (transactionData.customerId) {
          const customer = await Customer.findOne({ 
            _id: transactionData.customerId, 
            userId: transactionData.userId 
          });
          
          if (customer) {
            customer.currentBalance = transactionData.runningBalance;
            customer.lastTransactionDate = new Date();
            
            if (transactionData.debit > 0) {
              customer.totalUdhar += transactionData.debit;
            }
            if (transactionData.credit > 0) {
              customer.totalJama += transactionData.credit;
            }
            
            await customer.save();
          }
        }
        
        return normalizeDocument(transaction);
      } catch (error) {
        console.error('MongoDB create failed:', error.message);
        isMongoDBAvailable = false;
      }
    }
    
    return {
      ...transactionData,
      _id: `offline_${Date.now()}`,
      id: `offline_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      __offline: true,
    };
  },
};

/**
 * Get database status
 */
export async function getDatabaseStatus() {
  const useMongo = await checkMongoDBConnection();
  return {
    mongodb: useMongo,
    indexeddb: true, // Always available on client
    mode: useMongo ? 'online' : 'offline',
  };
}

export default {
  CustomersAdapter,
  InventoryAdapter,
  TransactionsAdapter,
  getDatabaseStatus,
};
