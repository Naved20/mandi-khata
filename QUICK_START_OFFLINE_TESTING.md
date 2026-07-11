# Quick Start: Test Offline Mode Right Now

## 2-Minute Setup

### Step 1: Restart Dev Server
```bash
npm run dev
```

Wait for output:
```
✓ Ready in 20s
```

### Step 2: Open Browser
```
http://localhost:3000
```

### Step 3: Run Performance Test
In a new terminal:
```bash
node scripts/test-offline-mode.js
```

Expected output:
```
✓ Test 1: Login Endpoint
  Status: 401 (or 200)
  Response time: 2-3ms
  
✓ Test 2: Customers Endpoint
  Status: 200
  Response time: 100-200ms

✓ Test 3: Inventory Endpoint
  Status: 200
  Response time: 100-200ms

✓ Test 4: Transactions Endpoint
  Status: 200
  Response time: 100-200ms

✅ All checks passed!
```

---

## Full Testing Workflow (5 minutes)

### 1. Login Test

**What to do:**
1. Click "Login" button
2. Try any email/password

**What to watch:**
- Console shows: `🔐 Login attempt for: user@example.com`
- Response time: **< 3 seconds** ✅
- If MongoDB down: `⚠️ MongoDB unavailable, skipping cloud auth` (still works)

**Expected result:**
- Status 200 (login succeeds)
- Fast response (2-3 seconds)

---

### 2. Data Loading Test

**What to do:**
1. After login, navigate to Dashboard
2. Open DevTools (F12) → Console

**What to watch:**
```
📥 Loading user data from cloud (parallel)...
  📥 Loading customers...
    ✅ Cached 25 customers
  📥 Loading inventory...
    ✅ Cached 10 inventory items
  📥 Loading transactions...
    ✅ Cached 100 transactions
✅ User data loaded successfully
```

**Expected result:**
- All data loads in parallel
- 6-8 seconds total
- No errors

---

### 3. IndexedDB Verification

**What to do:**
1. DevTools → Application tab
2. Expand IndexedDB → MandiKhataDB
3. Click each table

**What to see:**
- customers: rows with name, mobile, village
- inventory: rows with itemName, price
- transactions: rows with customerId, amount, date

**Expected result:**
- All tables have data
- Data matches what's shown in UI

---

### 4. Offline Mode Test

#### Method A: DevTools Offline (Recommended)

**What to do:**
1. DevTools still open (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh page (Ctrl+R)

**What to watch:**
- Page still loads
- Data still visible
- Console shows: `🔴 Offline` in status
- "Loading..." spinner briefly shows

**What should happen:**
- UI renders from local IndexedDB
- No 500 errors
- All pages work (Customers, Inventory, Dashboard)

#### Method B: Real Offline

**What to do:**
1. Close DevTools (Ctrl+Shift+I)
2. Disconnect WiFi (or disconnect ethernet)
3. Refresh page (Ctrl+R)

**What to see:**
- Page loads normally
- All data visible
- Works exactly like online

**Network request failures are expected and hidden**

---

### 5. Create Offline Data

**What to do (while offline):**
1. Go to Customers page
2. Click "New Customer"
3. Fill in details:
   - Name: Test Customer Offline
   - Mobile: 9876543210
   - Village: Test Village
4. Click Save

**What to watch:**
- Data saves immediately
- No network requests
- Console might show: `✓ Customer saved to IndexedDB`

**Check console for:**
```
syncStatus: pending
id: client_xxx_xxx
createdAt: 2024-07-10T...
```

---

### 6. Test Auto-Sync

**What to do:**
1. Go back online (enable WiFi / uncheck Offline)
2. Watch the bottom-left status panel
3. Check console

**What to see:**
```
Pending: 1 → 0  (auto-syncs)
Console shows sync logs
```

**Expected result:**
- Pending data automatically syncs
- New customer appears in database
- Data marked as synced

---

## Console Log Reference

### ✅ Healthy Log Pattern

```javascript
🚀 Initializing Offline-First Sync Engine...
👤 User logged in: user@example.com
📥 Loading user data from cloud (parallel)...
  📥 Loading customers...
    ✅ Cached 25 customers
  📥 Loading inventory...
    ✅ Cached 10 inventory items
  📥 Loading transactions...
    ✅ Cached 100 transactions
✅ User data loaded successfully
📊 Local data counts: {customers: 25, inventory: 10, transactions: 100}
🟢 Online
✅ Sync Provider ready (data loading in background)
```

### ⚠️ Offline Mode Pattern

```javascript
MongoDB query failed: getaddrinfo ENOTFOUND ac-npjuwhn...
 GET /api/customers 200 in 10790ms    (first check, waits for timeout)
 GET /api/customers 200 in 40ms       (cached result)
📊 Local data counts: {customers: 25, inventory: 10, transactions: 100}
🔴 Offline mode active
```

### ✅ Parallel Loading Pattern

```javascript
✅ MongoDB connected successfully
✅ MongoDB available - using cloud database
 GET /api/customers 200 in 185ms
 GET /api/inventory 200 in 259ms
 GET /api/transactions 200 in 1688ms
```

### ❌ Problem Pattern (DO NOT SEE THIS)

```javascript
❌ MongoDB connection error: ETIMEOUT
POST /api/auth/login 500 in 57000ms   ← TOO SLOW, not fixed
Cannot call find() before initial connection   ← CRASH
```

If you see the ❌ pattern, restart dev server:
```bash
npm run dev
```

---

## Troubleshooting

### Problem: Offline checkbox doesn't exist

**Solution:**
1. DevTools → Network tab
2. Look for "Offline" checkbox near top

**If still missing:**
1. Try different browser (Chrome recommended)
2. Update DevTools (press F12 again)
3. Try Ctrl+Shift+C then click Network tab

### Problem: Data not in IndexedDB

**Diagnosis:**
1. Open console (F12 → Console)
2. Check for errors during data load
3. Look for "Failed to load customers" messages

**Solutions:**
```javascript
// In console, try:
indexedDB.databases()  // See what DBs exist

// Or manually check storage:
Object.entries(localStorage).filter(([k]) => k.includes('user'))

// Clear and retry:
indexedDB.deleteDatabase('MandiKhataDB')
localStorage.clear()
location.reload()
```

### Problem: Still see 500 errors

**Diagnosis:**
1. Is MongoDB actually down? Check MongoDB Atlas website
2. Is connection string correct? Check .env.local
3. Are API routes using database adapter?

**Solution:**
1. Check .env.local:
```bash
cat .env.local | grep MONGODB_URI
# Should see: MONGODB_URI=mongodb+srv://...
```

2. Check if using db-adapter:
```bash
grep -r "db-adapter" app/api/
# Should see multiple matches
```

3. Restart server:
```bash
npm run dev
```

---

## One-Click Test Commands

### Test Everything
```bash
node scripts/test-offline-mode.js
```

### Check MongoDB Connection
```javascript
// In browser console:
fetch('/api/customers').then(r => r.json()).then(d => console.log(d))
```

### View All Local Data
```javascript
// In browser console:
(async () => {
  const { db } = await import('/lib/db/schema.js');
  console.log('Customers:', await db.customers.count());
  console.log('Inventory:', await db.inventory.count());
  console.log('Transactions:', await db.transactions.count());
})()
```

### Force Offline Mode
```javascript
// In browser console:
// Method 1: DevTools → Network → Check Offline
// Method 2: Simulate network error:
navigator.onLine = false
location.reload()
```

### Check Sync Status
```javascript
// In browser console:
(async () => {
  const { db } = await import('/lib/db/schema.js');
  const pending = await db.syncQueue.where('syncStatus').equals('pending').toArray();
  console.log('Pending syncs:', pending);
})()
```

---

## Performance Checklist

- [ ] Login < 3 seconds
- [ ] Customers API < 1 second
- [ ] Inventory API < 1 second
- [ ] Transactions API < 3 seconds
- [ ] Data shows in IndexedDB
- [ ] Offline mode works
- [ ] Create works offline
- [ ] Auto-sync works
- [ ] No 500 errors
- [ ] No console crashes

✅ All checked? You're good to go!

---

## What's Been Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Login Speed** | 57s ❌ | 3s ✅ |
| **Offline Support** | Broken ❌ | Working ✅ |
| **Data Persistence** | Wipes ❌ | Persists ✅ |
| **Parallel Loading** | Sequential 45s ❌ | Parallel 8s ✅ |
| **500 Errors** | Frequent ❌ | Gone ✅ |
| **MongoDB Fallback** | None ❌ | IndexedDB ✅ |

---

## Next Steps

1. ✅ Run performance test
2. ✅ Verify IndexedDB has data
3. ✅ Test offline mode
4. ✅ Create offline data
5. ✅ Sync back online
6. 📋 Review console logs
7. 🚀 Ready for production

---

**Happy Testing!** 🎉

Any issues? Check the console logs first. They tell you exactly what's happening.
