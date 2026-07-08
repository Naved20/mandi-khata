import { connectDB } from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const item = await Inventory.findById(id);

    if (!item) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        item,
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

    const { id } = params;
    const { itemName, category, currentStock, unit, buyingPrice, sellingPrice, reorderLevel, notes } = await req.json();

    const item = await Inventory.findById(id);

    if (!item) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (itemName) item.itemName = itemName;
    if (category) item.category = category;
    if (currentStock !== undefined) item.currentStock = currentStock;
    if (unit) item.unit = unit;
    if (buyingPrice) item.buyingPrice = buyingPrice;
    if (sellingPrice) item.sellingPrice = sellingPrice;
    if (reorderLevel !== undefined) item.reorderLevel = reorderLevel;
    if (notes) item.notes = notes;

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

    const { id } = params;
    const item = await Inventory.findById(id);

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
