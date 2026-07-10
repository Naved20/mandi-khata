import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();

    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const customers = await Customer.find({ userId, isActive: true })
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

    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { name, mobileNumber, village, address, notes } = await req.json();

    // Validate required fields
    if (!name || !mobileNumber) {
      return Response.json(
        { error: 'Please provide name and mobile number' },
        { status: 400 }
      );
    }

    // Check if customer already exists FOR THIS USER
    const existingCustomer = await Customer.findOne({ userId, mobileNumber });
    if (existingCustomer) {
      return Response.json(
        { error: 'Customer with this mobile number already exists' },
        { status: 409 }
      );
    }

    // Create new customer
    const customer = new Customer({
      userId,
      name,
      mobileNumber,
      village,
      address,
      notes,
      currentBalance: 0,
    });

    await customer.save();

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
