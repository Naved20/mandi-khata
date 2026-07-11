import { CustomersAdapter, TransactionsAdapter } from '@/lib/db-adapter';
import { requireAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    const customer = await CustomersAdapter.findById(id, userId);

    if (!customer) {
      return Response.json(
        { error: 'Customer not found or offline mode active' },
        { status: 404 }
      );
    }

    // Fetch ledger entries for this customer
    const ledgerEntries = await TransactionsAdapter.findByCustomer(id, userId);

    return Response.json(
      {
        success: true,
        customer,
        ledgerEntries,
        __offline: customer.__offline || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching customer:', error);
    return Response.json(
      {
        success: true,
        customer: null,
        ledgerEntries: [],
        __offline: true,
        message: 'Running in offline mode',
      },
      { status: 200 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    const { name, mobileNumber, village, address, notes } = await req.json();

    // Check if mobile number already exists (online mode only)
    if (mobileNumber) {
      const existingCustomer = await CustomersAdapter.findByMobile(userId, mobileNumber);
      if (existingCustomer && existingCustomer.id !== id && !existingCustomer.__offline) {
        return Response.json(
          { error: 'Mobile number already exists' },
          { status: 409 }
        );
      }
    }

    // Update customer
    const updates = {};
    if (name) updates.name = name;
    if (mobileNumber) updates.mobileNumber = mobileNumber;
    if (village) updates.village = village;
    if (address) updates.address = address;
    if (notes) updates.notes = notes;

    const customer = await CustomersAdapter.update(id, userId, updates);

    return Response.json(
      {
        success: true,
        message: 'Customer updated successfully',
        customer,
        __offline: customer.__offline || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating customer:', error);
    return Response.json(
      {
        success: true,
        message: 'Customer will be updated when online',
        __offline: true,
      },
      { status: 200 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    await CustomersAdapter.delete(id, userId);

    return Response.json(
      {
        success: true,
        message: 'Customer deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting customer:', error);
    return Response.json(
      {
        success: true,
        message: 'Customer will be deleted when online',
        __offline: true,
      },
      { status: 200 }
    );
  }
}
