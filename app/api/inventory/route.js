import { connectDB } from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function GET(req) {
  try {
    await connectDB();

    const inventory = await Inventory.find({ isActive: true })
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

    const { itemName, category, currentStock, unit, buyingPrice, sellingPrice, reorderLevel, notes } = await req.json();

    // Validate required fields
    if (!itemName || !category || !unit || !buyingPrice || !sellingPrice) {
      return Response.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if item already exists
    const existingItem = await Inventory.findOne({ itemName });
    if (existingItem) {
      return Response.json(
        { error: 'Item already exists' },
        { status: 409 }
      );
    }

    // Create new inventory item
    const item = new Inventory({
      itemName,
      category,
      currentStock: currentStock || 0,
      unit,
      buyingPrice,
      sellingPrice,
      reorderLevel: reorderLevel || 0,
      notes,
    });

    await item.save();

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
