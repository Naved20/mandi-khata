import { connectDB } from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import PriceHistory from '@/models/PriceHistory';
import { requireAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();

    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    const item = await Inventory.findOne({ _id: id, userId });

    if (!item) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Fetch price history for this item
    const priceHistory = await PriceHistory.find({ inventoryItemId: id, userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 price changes

    return Response.json(
      {
        success: true,
        item,
        priceHistory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return Response.json(
      {
        error: 'Failed to fetch inventory item',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    const { itemName, price, notes } = await req.json();

    const item = await Inventory.findOne({ _id: id, userId });

    if (!item) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const oldPrice = item.price;

    // Update fields
    if (itemName) item.itemName = itemName;
    if (price !== undefined && price !== oldPrice) {
      item.price = price;

      // Save price history when price changes
      const priceHistory = new PriceHistory({
        userId,
        inventoryItemId: item._id,
        itemName: item.itemName,
        oldPrice: oldPrice,
        newPrice: price,
        changeType: 'updated',
        notes: notes || 'Price updated',
      });

      await priceHistory.save();
    }
    if (notes !== undefined) item.notes = notes;

    item.updatedAt = new Date();
    await item.save();

    return Response.json(
      {
        success: true,
        message: 'Inventory item updated successfully',
        item,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return Response.json(
      {
        error: 'Failed to update inventory item',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    const item = await Inventory.findOne({ _id: id, userId });

    if (!item) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Soft delete
    item.isActive = false;
    await item.save();

    return Response.json(
      {
        success: true,
        message: 'Inventory item deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return Response.json(
      {
        error: 'Failed to delete inventory item',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
