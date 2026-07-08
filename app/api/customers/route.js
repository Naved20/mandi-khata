import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import LedgerEntry from '@/models/LedgerEntry';

export async function GET(req) {
  try {
    await connectDB();

    const customers = await Customer.find({ isActive: true })
      .sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        customers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching customers:', error);
    return Response.json(
      {
        error: 'Failed to fetch customers',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { name, mobileNumber, village, address, aadhaar, gstNumber, customerType, notes, openingBalance } = await req.json();

    // Validate required fields
    if (!name || !mobileNumber) {
      return Response.json(
        { error: 'Please provide name and mobile number' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ mobileNumber });
    if (existingCustomer) {
      return Response.json(
        { error: 'Customer with this mobile number already exists' },
        { status: 409 }
      );
    }

    // Create new customer
    const customer = new Customer({
      name,
      mobileNumber,
      village,
      address,
      aadhaar,
      gstNumber,
      customerType: customerType || 'farmer',
      notes,
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0,
    });

    await customer.save();

    // If opening balance exists, create a ledger entry
    if (openingBalance && openingBalance > 0) {
      const ledgerEntry = new LedgerEntry({
        customerId: customer._id,
        transactionType: 'udhar_cash',
        particular: 'Opening Balance',
        debit: openingBalance,
        runningBalance: openingBalance,
        date: new Date(),
        paymentMethod: 'none',
      });
      await ledgerEntry.save();
    }

    return Response.json(
      {
        success: true,
        message: 'Customer created successfully',
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    return Response.json(
      {
        error: 'Failed to create customer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
