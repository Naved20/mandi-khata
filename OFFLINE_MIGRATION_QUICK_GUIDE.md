# Offline-First Migration - Quick Guide

## Problem Fix (समस्या का समाधान)

**Current Issue:** App fails offline because pages directly call `/api/*` endpoints.

**Solution:** Convert pages to read/write from IndexedDB instead of API calls.

---

## How It Works Now (अब कैसे काम करेगा)

### Architecture Flow

```
USER ACTION
    ↓
READ/WRITE to IndexedDB (Instant! ⚡)
    ↓
UI UPDATES (0.1s)
    ↓
IF ONLINE: Background sync to MongoDB
```

### Benefits
- ⚡ **Instant loading** (no network wait)
- 🚀 **Offline forever** (works without internet)
- 🔄 **Auto-sync** (when online, syncs automatically)
- 📱 **PWA ready** (installable app)

---

## Step-by-Step Conversion (कैसे Convert करें)

### Step 1: Replace `fetch` with `useOfflineData` Hook

**OLD WAY ❌:**
```javascript
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchCustomers();
}, []);

const fetchCustomers = async () => {
  setLoading(true);
  const response = await fetch('/api/customers', {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  setCustomers(data.customers);
  setLoading(false);
};
```

**NEW WAY ✅:**
```javascript
import { useOfflineData } from '@/lib/hooks/useOfflineData';

// Just one line! Auto-updates in real-time!
const { data: customers, loading, error } = useOfflineData('customers');
```

---

### Step 2: Replace API Calls with Repository Functions

#### CREATE Operation

**OLD ❌:**
```javascript
const response = await fetch('/api/customers', {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(formData),
});
await fetchCustomers(); // Reload list
```

**NEW ✅:**
```javascript
import { createCustomer } from '@/lib/db/repositories/customer.repo';

await createCustomer(formData);
// No need to reload! useOfflineData hook auto-updates
```

#### UPDATE Operation

**OLD ❌:**
```javascript
await fetch(`/api/customers/${id}`, {
  method: 'PUT',
  headers: getAuthHeaders(),
  body: JSON.stringify(formData),
});
await fetchCustomers();
```

**NEW ✅:**
```javascript
import { updateCustomer } from '@/lib/db/repositories/customer.repo';

await updateCustomer(id, formData);
// No need to reload!
```

#### DELETE Operation

**OLD ❌:**
```javascript
await fetch(`/api/customers/${id}`, {
  method: 'DELETE',
  headers: getAuthHeaders(),
});
await fetchCustomers();
```

**NEW ✅:**
```javascript
import { deleteCustomer } from '@/lib/db/repositories/customer.repo';

await deleteCustomer(id);
// No need to reload!
```

---

## Complete Example (पूरा उदाहरण)

See: `EXAMPLE_OFFLINE_CUSTOMERS_PAGE.js`

Copy that pattern to your pages!

---

## Available Hooks & Functions

### Hooks (React Components)

```javascript
// 1. Read data with auto-updates
const { data, loading, error } = useOfflineData('customers');
const { data, loading, error } = useOfflineData('inventory');
const { data, loading, error } = useOfflineData('transactions');

// 2. Check network status
const isOnline = useNetworkStatus();

// 3. Check sync status
const syncStatus = useSyncStatus();
// syncStatus = { status: 'syncing' | 'idle' | 'error', pendingChanges: 5 }
```

### Repository Functions (CRUD Operations)

```javascript
// CUSTOMERS
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  getAllCustomers,
} from '@/lib/db/repositories/customer.repo';

// INVENTORY
import {
  createInventory,
  updateInventory,
  deleteInventory,
  getInventory,
  getAllInventory,
} from '@/lib/db/repositories/inventory.repo';

// TRANSACTIONS
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransaction,
  getAllTransactions,
} from '@/lib/db/repositories/transaction.repo';
```

---

## Pages to Convert (कौन-कौन से pages convert करें)

### High Priority ⚡
1. `app/dashboard/user/customers/page.js` ← Start here!
2. `app/dashboard/user/inventory/page.js`
3. `app/dashboard/user/transactions/page.js`
4. `app/dashboard/user/page.js` (main dashboard)

### Medium Priority
5. `app/dashboard/user/customers/[id]/page.js` (customer details)
6. `app/dashboard/user/inventory/[id]/page.js` (inventory details)
7. `app/dashboard/user/udhari/page.js`

### Low Priority (Keep as-is for now)
- Admin pages (require MongoDB)
- Reports (can generate from IndexedDB later)
- Master data pages

---

## Testing Offline Mode (Offline Test कैसे करें)

### Method 1: Chrome DevTools
1. Press `F12` to open DevTools
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Navigate around app
5. **Expected:** Everything works! ✅

### Method 2: Airplane Mode
1. Turn on Airplane Mode / WiFi off
2. Open app (localhost or installed PWA)
3. Create/Edit/Delete data
4. Turn WiFi back on
5. **Expected:** Data syncs automatically! 🔄

---

## Common Mistakes (सामान्य गलतियाँ)

### ❌ Mistake 1: Still calling fetch
```javascript
// DON'T DO THIS:
const response = await fetch('/api/customers');
```

### ✅ Fix:
```javascript
// DO THIS:
const { data: customers } = useOfflineData('customers');
```

---

### ❌ Mistake 2: Manual loading states
```javascript
// DON'T DO THIS:
const [loading, setLoading] = useState(true);
setLoading(true);
// ... fetch data
setLoading(false);
```

### ✅ Fix:
```javascript
// DO THIS:
const { data, loading } = useOfflineData('customers');
// Loading state handled automatically!
```

---

### ❌ Mistake 3: Reloading data after CRUD
```javascript
// DON'T DO THIS:
await createCustomer(data);
await fetchCustomers(); // ← Unnecessary!
```

### ✅ Fix:
```javascript
// DO THIS:
await createCustomer(data);
// That's it! Hook auto-updates
```

---

## Sync Behavior (Sync कैसे होता है)

### Automatic Sync Triggers
1. **On app start** (if logged in)
2. **Every 30 seconds** (background)
3. **On network reconnect** (online event)
4. **On window focus** (tab comes back)

### What Gets Synced
- **Upload:** Pending changes (create/update/delete) → MongoDB
- **Download:** Latest data from MongoDB → IndexedDB
- **Conflict resolution:** Last Write Wins (based on `updatedAt`)

---

## Data Initialization (पहली बार data कैसे आएगा)

### On Login
```javascript
// Automatically called after successful login
await initializeOfflineData();
```

This downloads:
- All customers
- All inventory
- All transactions

And stores them in IndexedDB for offline use.

### On Logout
```javascript
// Automatically clears all offline data
await clearOfflineData();
```

---

## Files You Need to Know (जरूरी Files)

### 1. Hooks (Use these in React components)
- `lib/hooks/useOfflineData.js` - Main data hook
- `lib/hooks/useNetworkStatus.js` - Online/offline detection
- `lib/hooks/useSyncStatus.js` - Sync status monitoring

### 2. Repositories (Use for CRUD operations)
- `lib/db/repositories/customer.repo.js`
- `lib/db/repositories/inventory.repo.js`
- `lib/db/repositories/transaction.repo.js`

### 3. Sync Engine (Automatic, no manual calls needed)
- `lib/sync/syncEngine.js` - Core sync logic
- `lib/sync/dataInitializer.js` - Initial data load
- `lib/sync/syncInitializer.js` - Sync startup

### 4. Components
- `components/SyncProvider.jsx` - Wrapper (already added to layout)
- `components/SyncStatusIndicator.jsx` - Shows sync status (already added)

---

## Quick Migration Checklist ✅

For each page you convert:

- [ ] Import `useOfflineData` hook
- [ ] Replace `useState` + `useEffect` + `fetch` with `useOfflineData`
- [ ] Import repository functions (create/update/delete)
- [ ] Replace API calls with repository calls
- [ ] Remove manual `fetchData()` calls after CRUD
- [ ] Remove `getAuthHeaders()` usage
- [ ] Test offline mode (F12 → Network → Offline)

---

## Current Status (अभी क्या है)

### ✅ Completed
- IndexedDB schema setup
- All repository functions
- All hooks (useOfflineData, useNetworkStatus, useSyncStatus)
- Sync engine (upload/download)
- SyncProvider component
- SyncStatusIndicator component
- Data initializer
- MongoDB connection improved (5s timeout instead of 57s)

### 🚧 In Progress
- Need to convert actual pages to use hooks
- Example provided: `EXAMPLE_OFFLINE_CUSTOMERS_PAGE.js`

### 📋 Todo
- Convert all user pages to offline-first
- Test CRUD operations offline
- Test sync when coming back online

---

## Summary (सारांश)

**Before (पहले):**
```javascript
fetch → wait for network (5-57s) → show data
```

**After (अब):**
```javascript
IndexedDB → instant data (0.1s) → background sync
```

**Result:**
- ⚡ 50x faster
- 🚀 Works offline
- 🔄 Auto-sync
- 📱 PWA ready

**Next Step:** Start with customers page, copy the pattern from `EXAMPLE_OFFLINE_CUSTOMERS_PAGE.js`

---

## Need Help? (मदद चाहिए?)

Check these files:
1. `EXAMPLE_OFFLINE_CUSTOMERS_PAGE.js` - Complete working example
2. `SAMAJH_ME_AAYA.md` - Hindi/English explanation
3. `MONGODB_CONNECTION_TROUBLESHOOTING.md` - Connection issues
4. `PWA_IMPLEMENTATION_STATUS.md` - Implementation checklist

**Bas! Ab convert karo aur enjoy karo fast offline app! 🎉**
