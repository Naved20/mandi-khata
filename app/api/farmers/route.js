import { connectDB } from '@/lib/mongodb';
import Farmer from '@/models/Farmer';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, phone, address, openingBalance } = body;

    // Validate required fields
    if (!name || !phone) {
      return Response.json(
        {
          error: 'Missing required fields: name, phone',
        },
        { status: 400 }
      );
    }

    // Check if farmer with this phone already exists
    const existingFarmer = await Farmer.findOne({ phone });
    if (existingFarmer) {
      return Response.json(
        {
          error: 'Farmer with this phone number already exists',
        },
        { status: 400 }
      );
    }

    // Create new farmer
    const farmer = new Farmer({
      name,
      phone,
      address,
      openingBalance: openingBalance || 0,
    });

    const savedFarmer = await farmer.save();

    return Response.json(
      {
        success: true,
        farmer: savedFarmer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Farmer creation error:', error);
    return Response.json(
      {
        error: 'Failed to create farmer',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = parseInt(searchParams.get('skip')) || 0;
    const search = searchParams.get('search');

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const farmers = await Farmer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Farmer.countDocuments(query);

    return Response.json(
      {
        farmers,
        total,
        limit,
        skip,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch farmers error:', error);
    return Response.json(
      {
        error: 'Failed to fetch farmers',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
