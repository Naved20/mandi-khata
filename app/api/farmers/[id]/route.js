import { connectDB } from '@/lib/mongodb';
import Farmer from '@/models/Farmer';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const farmer = await Farmer.findById(params.id);

    if (!farmer) {
      return Response.json(
        {
          error: 'Farmer not found',
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        farmer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch farmer error:', error);
    return Response.json(
      {
        error: 'Failed to fetch farmer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, phone, address, openingBalance } = body;

    const farmer = await Farmer.findById(params.id);

    if (!farmer) {
      return Response.json(
        {
          error: 'Farmer not found',
        },
        { status: 404 }
      );
    }

    // Update fields
    if (name) farmer.name = name;
    if (address) farmer.address = address;
    if (openingBalance !== undefined) farmer.openingBalance = openingBalance;
    if (phone && phone !== farmer.phone) {
      // Check if new phone already exists
      const existingFarmer = await Farmer.findOne({ phone });
      if (existingFarmer) {
        return Response.json(
          {
            error: 'Farmer with this phone number already exists',
          },
          { status: 400 }
        );
      }
      farmer.phone = phone;
    }

    const updatedFarmer = await farmer.save();

    return Response.json(
      {
        success: true,
        farmer: updatedFarmer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Farmer update error:', error);
    return Response.json(
      {
        error: 'Failed to update farmer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const farmer = await Farmer.findByIdAndDelete(params.id);

    if (!farmer) {
      return Response.json(
        {
          error: 'Farmer not found',
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Farmer deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Farmer deletion error:', error);
    return Response.json(
      {
        error: 'Failed to delete farmer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
