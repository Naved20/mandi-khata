import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import LedgerEntry from '@/models/LedgerEntry';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch ledger entries for this customer
    const ledgerEntries = await LedgerEntry.find({ customerId: id })
      .sort({ date: -1 });

    return Response.json(
      {
        success: true,
        customer,
        ledgerEntries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching customer:', error);
    return Response.json(
      {
        error: 'Failed to fetch customer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { name, mobileNumber, village, address, aadhaar, gstNumber, customerType, notes } = await req.json();

    // Find customer
    const customer = await Customer.findById(id);

    if (!customer) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if mobile number is being changed and if new number already exists
    if (mobileNumber && mobileNumber !== customer.mobileNumber) {
      const existingCustomer = await Customer.findOne({ mobileNumber });
      if (existingCustomer) {
        return Response.json(
          { error: 'Mobile number already exists' },
          { status: 409 }
        );
      }
      customer.mobileNumber = mobileNumber;
    }

    // Update fields
    if (name) customer.name = name;
    if (village) customer.village = village;
    if (address) customer.address = address;
    if (aadhaar) customer.aadhaar = aadhaar;
    if (gstNumber) customer.gstNumber = gstNumber;
    if (customerType) customer.customerType = customerType;
    if (notes) customer.notes = notes;

    customer.updatedAt = new Date();
    await customer.save();

    return Response.json(
      {
        success: true,
        message: 'Customer updated successfully',
        customer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating customer:', error);
    return Response.json(
      {
        error: 'Failed to update customer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive
    customer.isActive = false;
    await customer.save();

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
        error: 'Failed to delete customer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
