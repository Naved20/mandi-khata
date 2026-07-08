import { connectDB } from '@/lib/mongodb';
import LedgerEntry from '@/models/LedgerEntry';
import Customer from '@/models/Customer';
import Inventory from '@/models/Inventory';

export async function GET(req) {
  try {
    await connectDB();

    const { customerId } = req.nextUrl.searchParams;
    let query = {};

    if (customerId) {
      query.customerId = customerId;
    }

    const transactions = await LedgerEntry.find(query)
      .populate('customerId', 'name mobileNumber')
      .populate('inventoryItemId', 'itemName')
      .sort({ date: -1 });

    return Response.json(
      {
        success: true,
        transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return Response.json(
      {
        error: 'Failed to fetch transactions',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const {
      customerId,
      transactionType,
      particular,
      inventoryItemId,
      quantity,
      rate,
      amount,
      paymentMethod,
      notes,
      date,
    } = await req.json();

    // Validate required fields
    if (!customerId || !transactionType || !particular) {
      return Response.json(
        { error: 'Please provide required fields' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return Response.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    let debit = 0;
    let credit = 0;
    let actualAmount = amount || 0;

    // Determine debit/credit based on transaction type
    if (transactionType.startsWith('udhar')) {
      debit = actualAmount;
    } else if (transactionType.startsWith('jama')) {
      credit = actualAmount;
    }

    // Calculate running balance
    const runningBalance = customer.currentBalance + debit - credit;

    // Create ledger entry
    const ledgerEntry = new LedgerEntry({
      customerId,
      transactionType,
      particular,
      debit,
      credit,
      runningBalance,
      inventoryItemId: inventoryItemId || null,
      quantity: quantity || null,
      unit: inventoryItemId ? (await Inventory.findById(inventoryItemId)).unit : null,
      rate: rate || null,
      paymentMethod: paymentMethod || 'cash',
      notes,
      date: new Date(date) || new Date(),
    });

    await ledgerEntry.save();

    // Update customer balance and dates
    customer.currentBalance = runningBalance;
    customer.lastTransactionDate = new Date();

    if (debit > 0) {
      customer.totalUdhar += debit;
    }
    if (credit > 0) {
      customer.totalJama += credit;
    }

    await customer.save();

    // If it's an inventory transaction, reduce stock
    if (inventoryItemId && transactionType === 'udhar_inventory' && quantity) {
      const inventoryItem = await Inventory.findById(inventoryItemId);
      if (inventoryItem) {
        inventoryItem.currentStock -= quantity;
        await inventoryItem.save();
      }
    }

    return Response.json(
      {
        success: true,
        message: 'Transaction created successfully',
        ledgerEntry,
        updatedBalance: runningBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return Response.json(
      {
        error: 'Failed to create transaction',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
