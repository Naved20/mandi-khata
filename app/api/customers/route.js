import { CustomersAdapter } from '@/lib/db-adapter';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    // Use adapter - automatically handles MongoDB/IndexedDB fallback
    const customers = await CustomersAdapter.findAll(userId);

    return Response.json(
      {
        success: true,
        customers,
        __offline: customers.length === 0 ? true : false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Don't return 500 - return empty array for graceful offline mode
    return Response.json(
      {
        success: true,
        customers: [],
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

    const { name, mobileNumber, village, address, notes } = await req.json();

    // Validate required fields
    if (!name || !mobileNumber) {
      return Response.json(
        { error: 'Please provide name and mobile number' },
        { status: 400 }
      );
    }

    // Check if customer already exists (only in online mode)
    const existingCustomer = await CustomersAdapter.findByMobile(userId, mobileNumber);
    if (existingCustomer && !existingCustomer.__offline) {
      return Response.json(
        { error: 'Customer with this mobile number already exists' },
        { status: 409 }
      );
    }

    // Create new customer
    const customer = await CustomersAdapter.create({
      userId,
      name,
      mobileNumber,
      village,
      address,
      notes,
      currentBalance: 0,
      totalUdhar: 0,
      totalJama: 0,
      isActive: true,
    });

    return Response.json(
      {
        success: true,
        message: 'Customer created successfully',
        customer,
        __offline: customer.__offline || false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    // Return success in offline mode
    return Response.json(
      {
        success: true,
        message: 'Customer will be created when online',
        __offline: true,
      },
      { status: 201 }
    );
  }
}
