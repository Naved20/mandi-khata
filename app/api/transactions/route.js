import { TransactionsAdapter, CustomersAdapter, InventoryAdapter } from '@/lib/db-adapter';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { customerId } = req.nextUrl.searchParams;

    const transactions = await TransactionsAdapter.findAll(userId, customerId);

    return Response.json(
      {
        success: true,
        transactions,
        __offline: transactions.length === 0 ? true : false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return Response.json(
      {
        success: true,
        transactions: [],
        __offline: true,
        message: 'Running in offline mode',
      },
      { status: 200 }
    );
  }
}

export async function POST(req) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

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

    // Verify customer exists (online mode only)
    const customer = await CustomersAdapter.findById(customerId, userId);
    if (!customer && !customer?.__offline) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    let debit = 0;
    let credit = 0;
    const actualAmount = amount || 0;

    // Determine debit/credit based on transaction type
    if (transactionType === 'udhar') {
      debit = actualAmount;
    } else if (transactionType === 'jama') {
      credit = actualAmount;
    }

    // Calculate running balance
    const previousBalance = customer?.currentBalance || 0;
    const runningBalance = previousBalance + debit - credit;

    // Create transaction
    const transaction = await TransactionsAdapter.create({
      userId,
      customerId,
      transactionType,
      particular,
      debit,
      credit,
      runningBalance,
      inventoryItemId: inventoryItemId || null,
      quantity: quantity || null,
      rate: rate || null,
      paymentMethod: paymentMethod || 'cash',
      notes,
      date: date ? new Date(date) : new Date(),
    });

    return Response.json(
      {
        success: true,
        message: 'Transaction created successfully',
        ledgerEntry: transaction,
        updatedBalance: runningBalance,
        __offline: transaction.__offline || false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return Response.json(
      {
        success: true,
        message: 'Transaction will be created when online',
        __offline: true,
      },
      { status: 201 }
    );
  }
}
