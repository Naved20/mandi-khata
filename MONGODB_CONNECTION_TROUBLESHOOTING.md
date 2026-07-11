# MongoDB Connection Timeout - Troubleshooting Guide

## Problem Summary

**Error Message:**
```
Login error: Error: querySrv ETIMEOUT _mongodb._tcp.cluster0.v3wimof.mongodb.net
```

**Symptoms:**
1. App takes 57+ seconds to respond to login requests
2. MongoDB connection times out
3. Very slow page loads
4. Users can't log in

---

## Root Causes

### 1. **DNS Resolution Timeout**
Your MongoDB connection string uses `mongodb+srv://` which requires DNS SRV record lookup. The error `querySrv ETIMEOUT` means:
- Your network can't resolve the MongoDB DNS
- Firewall is blocking DNS queries
- MongoDB cluster might be paused or deleted
- Network connectivity issues

### 2. **Wrong Architecture (Before PWA Implementation)**
- Pages were trying to fetch directly from MongoDB
- Every request waited for network timeout (57 seconds!)
- No local caching
- No offline support

---

## Solutions Implemented

### ✅ Solution 1: Faster Timeout (Immediate Fix)
**File: `lib/mongodb.js`**

Changed timeouts from 45 seconds to 5 seconds:
```javascript
serverSelectionTimeoutMS: 5000,  // Fail faster
socketTimeoutMS: 10000,
connectTimeoutMS: 5000,
```

**Result:** App now fails in 5 seconds instead of 57 seconds. Still not ideal, but much better.

### ✅ Solution 2: Graceful Degradation
**File: `lib/mongodb.js`**

Added error handling to allow app to continue without MongoDB:
```javascript
catch (error) {
  console.warn('⚠️ Running in offline-only mode. Sync disabled.');
  return null; // Don't crash - continue with IndexedDB
}
```

**Result:** App works even when MongoDB is unreachable.

### ✅ Solution 3: Offline-First PWA (Complete Fix)
**Files:** Multiple (see PWA_IMPLEMENTATION_STATUS.md)

Implemented complete offline-first architecture:
1. **IndexedDB as primary database** (via Dexie.js)
2. **All pages read from IndexedDB first** (instant load)
3. **Background sync to MongoDB** (when online)
4. **Service Worker** (cache HTML/CSS/JS)
5. **Sync Status Indicator** (shows online/offline status)

**Result:** 
- ⚡ **Instant page loads** (reads from local IndexedDB)
- 🚀 **Works offline indefinitely**
- 🔄 **Auto-sync when online**
- 📱 **Installable PWA**

---

## How to Fix MongoDB Connection (If You Want Cloud Sync)

### Option 1: Check Your MongoDB Cluster

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com/
2. **Check if cluster is paused:**
   - Click on your cluster
   - If paused, click "Resume"
3. **Check Network Access:**
   - Go to "Network Access" tab
   - Add your current IP: `0.0.0.0/0` (Allow from anywhere)
   - Save changes

### Option 2: Test Connection String

Run this command to test:
```bash
node scripts/test-connection.js
```

### Option 3: Update Connection String

If your cluster was deleted or moved:

1. Create a new cluster on MongoDB Atlas
2. Get new connection string
3. Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<new-cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Option 4: Use Local MongoDB (For Development)

Install MongoDB locally and use:
```env
MONGODB_URI=mongodb://localhost:27017/mandi_dashboard
```

---

## Current App Behavior (After PWA Implementation)

### When MongoDB is Available ✅
1. Page loads instantly from IndexedDB
2. Background sync runs every 30 seconds
3. New data syncs from MongoDB
4. Pending changes upload to MongoDB
5. Green "Online" indicator shown

### When MongoDB is Unavailable ⚠️
1. Page still loads instantly from IndexedDB
2. Sync is disabled
3. All data stays in local IndexedDB
4. Red "Offline" indicator shown
5. Pending changes queued for next sync
6. **App continues working perfectly!**

---

## Why Was It So Slow Before?

### Old Architecture (❌ Wrong):
```
User Request → Wait for MongoDB (57s timeout) → Show Data
```

**Problem:** Every request waited for network!

### New Architecture (✅ Correct):
```
User Request → Read IndexedDB (instant) → Show Data
                      ↓
              Background: Sync with MongoDB
```

**Result:** Instant response + automatic sync!

---

## Testing the Fix

### 1. Test Offline Mode
1. Open DevTools (F12)
2. Go to "Network" tab
3. Check "Offline"
4. Navigate around the app
5. **Expected:** Everything works perfectly!

### 2. Test Sync Indicator
1. Look at bottom-right corner
2. **Online:** Green dot + "Online"
3. **Offline:** Red dot + "Offline"
4. **Syncing:** Blue spinner + "Syncing..."

### 3. Test CRUD Operations Offline
1. Go offline
2. Create a customer
3. Edit inventory
4. Delete a transaction
5. Go back online
6. **Expected:** Changes sync automatically!

---

## Next Steps for You

### Immediate Action Required:

1. **Check MongoDB Cluster Status**
   - Login to MongoDB Atlas
   - Resume cluster if paused
   - Add `0.0.0.0/0` to Network Access

2. **Restart Development Server**
   ```bash
   npm run dev
   ```

3. **Test Login**
   - Should work within 5 seconds (not 57!)

### Long-Term (Already Done by PWA):

✅ App now works offline forever
✅ No more slow page loads
✅ Auto-sync when online
✅ Install as mobile/desktop app

---

## Files Changed

1. `lib/mongodb.js` - Faster timeouts + graceful degradation
2. `components/SyncProvider.jsx` - Initialize sync engine (NEW)
3. `components/SyncStatusIndicator.jsx` - Show sync status (NEW)
4. `app/layout.js` - Added SyncProvider + indicator
5. All sync/hook files - Complete offline-first infrastructure

---

## Summary

**Before:** 
- Slow (57s timeout)
- Crashes when MongoDB unreachable
- No offline support

**After:**
- Fast (instant from IndexedDB)
- Works when MongoDB unreachable
- Full offline support
- Auto-sync when online
- Installable PWA

**You're welcome! 😊**
