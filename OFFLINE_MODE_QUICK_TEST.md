# 🔴 Offline Mode - Quick Test Guide

## समस्या (Problem)
Pages offline जाते ही सब blank हो जाते हैं - data नहीं दिखता।

## 🔧 Fix किया गया (What I Fixed)

### 1. **useOfflineData Hook** - अब सही काम कर रहा है
- IndexedDB से पहले data पढ़ता है
- Offline में भी data show करता है
- API से fresh data sync करता है जब online हो

### 2. **Data Persistence**
- जब login करते हो, data IndexedDB में automatically save होता है
- Offline होने पर भी यही data show होता है

---

## ✅ क्या काम करना चाहिए (What Should Work Now)

### **Scenario 1: Online से Offline**
1. **Login करो** (mim@gmail.com)
2. **Wait 2-3 seconds** - data load होगा
3. DevTools खोलो: **F12 → Application → IndexedDB → MandiKhataDB**
4. देखो: `customers`, `inventory`, `transactions` tables में data होना चाहिए
5. **DevTools → Network tab → "Offline" checkbox** check करो
6. **Page refresh करो** (F5)
7. ✅ Expected: Page normally load होगा, data दिखेगा

### **Scenario 2: Data Verify करना**
DevTools में देखो कि data सही जगह save हो रहा है:
```
IndexedDB
  → MandiKhataDB
    → customers (e.g., 1 customer)
    → inventory (e.g., 6 items)
    → transactions (e.g., 3 transactions)
```

### **Scenario 3: Offline में नया data add करना**
1. Offline रहते हुए
2. "Add Customer" button click करो
3. Form fill करो
4. Submit करो
5. ✅ Expected: List में नया customer दिख जाए (even offline)

---

## ❌ अगर अभी भी problem हो (If Still Having Issues)

### **Check करना:**
1. Console में logs देखो (F12 → Console):
   - ✅ Good: `📖 Reading customers from IndexedDB...`
   - ✅ Good: `✅ Found X customers in IndexedDB`
   - ❌ Bad: Errors या exceptions

2. Network tab में देखो:
   - Offline में API calls 404 होंगे - **यह normal है**
   - Offline में CSS/JS loads properly होना चाहिए

3. IndexedDB structure:
   - `isDeleted: false` items ही show होंगे
   - Deleted items filter out हो जाएंगे

---

## 📍 Database Location
```
Browser → DevTools → Application
  → IndexedDB
    → MandiKhataDB (यही database है)
      → 3 main tables:
         1. customers
         2. inventory
         3. transactions
```

---

## 🧪 Testing Steps (Complete Flow)

### Step 1: First Time Login
```
1. Go to: http://localhost:3001/login
2. Email: mim@gmail.com
3. Password: (your password)
4. Click Login
5. WAIT 3 seconds (data loading to IndexedDB)
6. Observe console: ✅ Data loaded
```

### Step 2: Check IndexedDB
```
1. F12 → Application tab
2. Left sidebar: IndexedDB → MandiKhataDB
3. Click: customers table
4. Should see: 1+ customer records
5. Click: inventory table
6. Should see: 6+ inventory items
7. Click: transactions table
8. Should see: 3+ transaction records
```

### Step 3: Go Offline
```
1. DevTools → Network tab
2. Check checkbox: "Offline"
3. F5 (refresh page)
4. Expected: Page loads normally with data
```

### Step 4: Add Data Offline
```
1. Click "Add Customer" button
2. Fill form with test data
3. Click "Create"
4. Expected: Customer appears in list immediately
```

### Step 5: Go Back Online
```
1. Uncheck "Offline" checkbox
2. F5 (refresh)
3. Data syncs from server
4. Should see updates from when you were offline
```

---

## 🐛 Debugging Tips

### If Pages Blank:
```
F12 → Console
Look for: TypeError or Cannot read property errors
These mean hook isn't working properly
```

### If Data Not Loading:
```
F12 → Application → IndexedDB → MandiKhataDB
If tables are empty:
- Data wasn't saved during login
- Check fast-data-loader.js logs
```

### If Offline Mode Still Broken:
```
Check console for:
- "📖 Reading customers from IndexedDB"
- Should see count of items
If not: Hook not executing properly
```

---

## ✨ Expected Behavior (Final)

| Scenario | Result |
|----------|--------|
| Online, first load | Data loads from API to IndexedDB, shows on page |
| Online, refresh | Shows IndexedDB data first, then syncs fresh from API |
| Go offline, refresh | Shows IndexedDB data only |
| Add/edit offline | Changes saved to IndexedDB with `syncStatus: 'pending'` |
| Go back online | Auto-syncs pending changes to server |

---

अगर कोई issue आए तो console logs भेजो! 🚀
