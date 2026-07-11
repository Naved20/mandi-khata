// lib/offline-storage-fix.js - Proper offline storage management
// यह file offline data को सही तरीके से handle करता है

import db from './db/schema';

/**
 * Offline Storage Manager
 * - सुनिश्चित करता है कि data IndexedDB में persist रहे
 * - Offline mode में भी data दिखाई दे
 */

class OfflineStorageManager {
  constructor() {
    this.isInitialized = false;
    this.storageKey = 'mandi_offline_storage_initialized';
  }

  /**
   * Initialize offline storage on app start
   * यह function app के सबसे शुरुआत में call होना चाहिए
   */
  async initialize() {
    try {
      console.log('🔄 Initializing offline storage manager...');
      
      // Check if already initialized
      const isInit = sessionStorage.getItem(this.storageKey);
      if (isInit && isInit === 'true') {
        console.log('✅ Offline storage already initialized');
        this.isInitialized = true;
        return true;
      }

      // Create tables if they don't exist
      await this.ensureTablesExist();
      
      // Load user data from localStorage
      const user = this.getCurrentUser();
      if (user) {
        console.log('👤 User found, loading offline data...');
        await this.loadUserData(user._id);
      }

      sessionStorage.setItem(this.storageKey, 'true');
      this.isInitialized = true;
      console.log('✅ Offline storage initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize offline storage:', error);
      return false;
    }
  }

  /**
   * Ensure all IndexedDB tables exist
   */
  async ensureTablesExist() {
    try {
      // This will create tables if they don't exist
      const tables = await db.tables;
      console.log('✅ IndexedDB tables verified:', tables.map(t => t.name));
      return true;
    } catch (error) {
      console.error('❌ Error ensuring tables exist:', error);
      return false;
    }
  }

  /**
   * Get current logged-in user from localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  }

  /**
   * Load user data from API and store in IndexedDB
   * यह function login के बाद call होना चाहिए
   */
  async loadUserData(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found, cannot load user data');
        return false;
      }

      console.log('📥 Loading user data from API...');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load customers
      try {
        console.log('  📥 Loading customers...');
        const customersRes = await fetch('/api/customers', { 
          headers,
          signal: AbortSignal.timeout(15000)
        });
        
        if (customersRes.ok) {
          const { customers } = await customersRes.json();
          if (customers && customers.length > 0) {
            // Store in IndexedDB
            for (const customer of customers) {
              await db.customers.put({
                id: customer._id?.toString() || customer.id,
                userId: customer.userId,
                name: customer.name,
                mobileNumber: customer.mobileNumber,
                village: customer.village || '',
                address: customer.address || '',
                currentBalance: customer.currentBalance || 0,
                totalUdhar: customer.totalUdhar || 0,
                totalJama: customer.totalJama || 0,
                isActive: customer.isActive !== false,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
                syncStatus: 'synced',
                lastSyncedAt: new Date().toISOString(),
                isDeleted: false,
              });
            }
            console.log(`    ✅ Stored ${customers.length} customers in IndexedDB`);
          }
        } else {
          console.warn('    ⚠️ Failed to fetch customers:', customersRes.status);
        }
      } catch (error) {
        console.warn('    ⚠️ Error loading customers:', error.message);
      }

      // Load inventory
      try {
        console.log('  📥 Loading inventory...');
        const inventoryRes = await fetch('/api/inventory', { 
          headers,
          signal: AbortSignal.timeout(15000)
        });
        
        if (inventoryRes.ok) {
          const { inventory } = await inventoryRes.json();
          if (inventory && inventory.length > 0) {
            for (const item of inventory) {
              await db.inventory.put({
                id: item._id?.toString() || item.id,
                userId: item.userId,
                itemName: item.itemName,
                price: item.price,
                notes: item.notes || '',
                isActive: item.isActive !== false,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                syncStatus: 'synced',
                lastSyncedAt: new Date().toISOString(),
                isDeleted: false,
              });
            }
            console.log(`    ✅ Stored ${inventory.length} inventory items in IndexedDB`);
          }
        } else {
          console.warn('    ⚠️ Failed to fetch inventory:', inventoryRes.status);
        }
      } catch (error) {
        console.warn('    ⚠️ Error loading inventory:', error.message);
      }

      // Load transactions
      try {
        console.log('  📥 Loading transactions...');
        const transactionsRes = await fetch('/api/transactions', { 
          headers,
          signal: AbortSignal.timeout(15000)
        });
        
        if (transactionsRes.ok) {
          const { transactions } = await transactionsRes.json();
          if (transactions && transactions.length > 0) {
            for (const tx of transactions) {
              await db.transactions.put({
                id: tx._id?.toString() || tx.id,
                userId: tx.userId,
                customerId: tx.customerId,
                transactionType: tx.transactionType,
                particular: tx.particular || '',
                debit: tx.debit || 0,
                credit: tx.credit || 0,
                runningBalance: tx.runningBalance || 0,
                date: tx.date,
                paymentMethod: tx.paymentMethod || 'cash',
                notes: tx.notes || '',
                createdAt: tx.createdAt,
                updatedAt: tx.updatedAt,
                syncStatus: 'synced',
                lastSyncedAt: new Date().toISOString(),
                isDeleted: false,
              });
            }
            console.log(`    ✅ Stored ${transactions.length} transactions in IndexedDB`);
          }
        } else {
          console.warn('    ⚠️ Failed to fetch transactions:', transactionsRes.status);
        }
      } catch (error) {
        console.warn('    ⚠️ Error loading transactions:', error.message);
      }

      console.log('✅ User data loading complete!');
      return true;
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      return false;
    }
  }

  /**
   * Check IndexedDB status
   */
  async getStorageStatus() {
    try {
      const customerCount = await db.customers.count();
      const inventoryCount = await db.inventory.count();
      const transactionCount = await db.transactions.count();
      const pendingSyncCount = await db.syncQueue.where('syncStatus').equals('pending').count();

      return {
        customersCount: customerCount,
        inventoryCount,
        transactionCount,
        pendingSyncCount,
        online: navigator.onLine,
      };
    } catch (error) {
      console.error('Error getting storage status:', error);
      return null;
    }
  }

  /**
   * Force reload data from API
   */
  async forceReloadData() {
    const user = this.getCurrentUser();
    if (!user) {
      console.warn('⚠️ No user logged in');
      return false;
    }

    // Clear existing data
    await db.customers.clear();
    await db.inventory.clear();
    await db.transactions.clear();

    // Reload
    return await this.loadUserData(user._id);
  }

  /**
   * Save new customer to IndexedDB
   */
  async saveCustomer(customer) {
    try {
      const data = {
        id: customer.id || `offline_${Date.now()}`,
        userId: customer.userId,
        name: customer.name,
        mobileNumber: customer.mobileNumber,
        village: customer.village || '',
        address: customer.address || '',
        currentBalance: customer.currentBalance || 0,
        totalUdhar: customer.totalUdhar || 0,
        totalJama: customer.totalJama || 0,
        isActive: true,
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
        lastSyncedAt: null,
        isDeleted: false,
      };

      await db.customers.put(data);
      console.log('✅ Customer saved to IndexedDB:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      throw error;
    }
  }

  /**
   * Get all customers from IndexedDB
   */
  async getAllCustomers() {
    try {
      const customers = await db.customers
        .where('isDeleted')
        .equals(false)
        .toArray();
      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  /**
   * Get all inventory from IndexedDB
   */
  async getAllInventory() {
    try {
      const inventory = await db.inventory
        .where('isDeleted')
        .equals(false)
        .toArray();
      return inventory;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }

  /**
   * Get all transactions from IndexedDB
   */
  async getAllTransactions() {
    try {
      const transactions = await db.transactions
        .where('isDeleted')
        .equals(false)
        .toArray();
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Persist data to localStorage as backup
   * (Optional - for extra safety)
   */
  async backupToLocalStorage() {
    try {
      const customers = await db.customers.toArray();
      const inventory = await db.inventory.toArray();
      const transactions = await db.transactions.toArray();

      const backup = {
        customers,
        inventory,
        transactions,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('offline_backup', JSON.stringify(backup));
      console.log('✅ Offline data backed up to localStorage');
      return true;
    } catch (error) {
      console.error('Error backing up data:', error);
      return false;
    }
  }

  /**
   * Restore data from localStorage backup
   * (Optional - for recovery)
   */
  async restoreFromLocalStorage() {
    try {
      const backupStr = localStorage.getItem('offline_backup');
      if (!backupStr) {
        console.warn('⚠️ No backup found');
        return false;
      }

      const backup = JSON.parse(backupStr);
      
      // Restore customers
      for (const customer of backup.customers) {
        await db.customers.put(customer);
      }
      
      // Restore inventory
      for (const item of backup.inventory) {
        await db.inventory.put(item);
      }
      
      // Restore transactions
      for (const tx of backup.transactions) {
        await db.transactions.put(tx);
      }

      console.log('✅ Offline data restored from localStorage');
      return true;
    } catch (error) {
      console.error('Error restoring data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

export default offlineStorage;
