#!/usr/bin/env node

/**
 * Test offline mode - Run this after starting the dev server
 * 
 * Usage:
 * 1. Start the dev server: npm run dev
 * 2. In another terminal: node scripts/test-offline-mode.js
 */

const BASE_URL = 'http://localhost:3000';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(method, path, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const json = await response.json();

    return {
      status: response.status,
      data: json,
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Offline Mode Performance\n');
  console.log('='.repeat(60));

  // Test 1: Login with MongoDB available
  console.log('\n✓ Test 1: Login Endpoint');
  console.log('  Testing login response time...');
  
  const loginStart = Date.now();
  const loginResult = await testEndpoint('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'test123',
  });
  const loginTime = Date.now() - loginStart;

  console.log(`  Status: ${loginResult.status}`);
  console.log(`  Response time: ${loginTime}ms`);
  console.log(`  Offline flag: ${loginResult.data?.__offline ? '✓ Yes (offline mode)' : '✗ No (online)'}`);

  if (loginTime > 3000) {
    console.warn(`  ⚠️ WARNING: Login took ${loginTime}ms (should be <3000ms for online)`);
  } else {
    console.log(`  ✓ Login is fast enough`);
  }

  // Test 2: Customers endpoint
  console.log('\n✓ Test 2: Customers Endpoint');
  console.log('  Testing customers response time...');
  
  const customersStart = Date.now();
  const customersResult = await testEndpoint('GET', '/api/customers');
  const customersTime = Date.now() - customersStart;

  console.log(`  Status: ${customersResult.status}`);
  console.log(`  Response time: ${customersTime}ms`);
  console.log(`  Customers returned: ${customersResult.data?.customers?.length || 0}`);

  if (customersResult.status === 200) {
    if (customersTime > 1000) {
      console.warn(`  ⚠️ WARNING: Customers took ${customersTime}ms (should be <1000ms)`);
    } else {
      console.log(`  ✓ Customers endpoint is fast`);
    }
  } else if (customersResult.status === 500) {
    console.error(`  ✗ ERROR: Customers returned 500 error (MongoDB connection issue)`);
  }

  // Test 3: Inventory endpoint
  console.log('\n✓ Test 3: Inventory Endpoint');
  console.log('  Testing inventory response time...');
  
  const inventoryStart = Date.now();
  const inventoryResult = await testEndpoint('GET', '/api/inventory');
  const inventoryTime = Date.now() - inventoryStart;

  console.log(`  Status: ${inventoryResult.status}`);
  console.log(`  Response time: ${inventoryTime}ms`);
  console.log(`  Inventory items returned: ${inventoryResult.data?.inventory?.length || 0}`);

  // Test 4: Transactions endpoint
  console.log('\n✓ Test 4: Transactions Endpoint');
  console.log('  Testing transactions response time...');
  
  const transactionsStart = Date.now();
  const transactionsResult = await testEndpoint('GET', '/api/transactions');
  const transactionsTime = Date.now() - transactionsStart;

  console.log(`  Status: ${transactionsResult.status}`);
  console.log(`  Response time: ${transactionsTime}ms`);
  console.log(`  Transactions returned: ${transactionsResult.data?.transactions?.length || 0}`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Performance Summary:\n');
  console.log(`  Login:        ${loginTime}ms`);
  console.log(`  Customers:    ${customersTime}ms`);
  console.log(`  Inventory:    ${inventoryTime}ms`);
  console.log(`  Transactions: ${transactionsTime}ms`);
  console.log(`  Total:        ${loginTime + customersTime + inventoryTime + transactionsTime}ms`);

  // Check for issues
  console.log('\n📋 Status Check:\n');

  const issues = [];

  if (loginResult.status === 500) {
    issues.push('  ✗ Login endpoint returning 500 errors');
  } else if (loginTime > 5000) {
    issues.push(`  ✗ Login is too slow (${loginTime}ms, target: <3000ms)`);
  } else {
    console.log('  ✓ Login endpoint working');
  }

  if (customersResult.status === 500) {
    issues.push('  ✗ Customers endpoint returning 500 errors (MongoDB not available)');
  } else if (customersResult.status === 200) {
    console.log('  ✓ Customers endpoint working');
  }

  if (inventoryResult.status === 500) {
    issues.push('  ✗ Inventory endpoint returning 500 errors');
  } else if (inventoryResult.status === 200) {
    console.log('  ✓ Inventory endpoint working');
  }

  if (transactionsResult.status === 500) {
    issues.push('  ✗ Transactions endpoint returning 500 errors');
  } else if (transactionsResult.status === 200) {
    console.log('  ✓ Transactions endpoint working');
  }

  if (issues.length > 0) {
    console.log('\n⚠️ Issues Found:\n');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n✅ All checks passed!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 Next Steps:\n');
  console.log('  1. Open browser DevTools (F12)');
  console.log('  2. Go to Application → IndexedDB → MandiKhataDB');
  console.log('  3. Check that customers, inventory, transactions tables have data');
  console.log('  4. Go to Network tab and check "Offline" checkbox');
  console.log('  5. Refresh page - should still work and show cached data');
  console.log('  6. Check console for sync logs\n');
}

// Run tests
runTests().catch(console.error);
