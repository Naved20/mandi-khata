import { connectDB } from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import PriceHistory from '@/models/PriceHistory';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();

    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const inventory = await Inventory.find({ userId, isActive: true })
      .sort({ itemName: 1 });

    return Response.json(
      {
        success: true,
        inventory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return Response.json(
      {
        error: 'Failed to fetch inventory',
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

    const { itemName, price, notes } = await req.json();

    // Validate required fields
    if (!itemName || !price) {
      return Response.json(
        { error: 'Please provide itemName and price' },
        { status: 400 }
      );
    }

    // Check if item already exists FOR THIS USER
    const existingItem = await Inventory.findOne({ userId, itemName });
    if (existingItem) {
      return Response.json(
        { error: 'Item already exists' },
        { status: 409 }
      );
    }

    // Create new inventory item
    const item = new Inventory({
      userId,
      itemName,
      price,
      notes,
    });

    await item.save();

    // Save initial price history
    const priceHistory = new PriceHistory({
      userId,
      inventoryItemId: item._id,
      itemName: item.itemName,
      oldPrice: 0,
      newPrice: price,
      changeType: 'created',
      notes: 'Item created with initial price',
    });

    await priceHistory.save();

    return Response.json(
      {
        success: true,
        message: 'Inventory item created successfully',
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return Response.json(
      {
        error: 'Failed to create inventory item',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
