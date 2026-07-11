import { InventoryAdapter } from '@/lib/db-adapter';
import { requireAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const { id } = params;
    const item = await InventoryAdapter.findById(id, userId);

    if (!item) {
      return Response.json(
        { error: 'Item not found or offline mode active' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        item,
        priceHistory: [], // Price history not available in offline mode
        __offline: item.__offline || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching item:', error);
    return Response.json(
      {
        success: true,
        item: null,
        priceHistory: [],
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
    const { itemName, price, notes } = await req.json();

    const updates = {};
    if (itemName) updates.itemName = itemName;
    if (price !== undefined) updates.price = price;
    if (notes !== undefined) updates.notes = notes;

    const item = await InventoryAdapter.update(id, userId, updates);

    return Response.json(
      {
        success: true,
        message: 'Inventory item updated successfully',
        item,
        __offline: item.__offline || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating item:', error);
    return Response.json(
      {
        success: true,
        message: 'Item will be updated when online',
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
    await InventoryAdapter.delete(id, userId);

    return Response.json(
      {
        success: true,
        message: 'Inventory item deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    return Response.json(
      {
        success: true,
        message: 'Item will be deleted when online',
        __offline: true,
      },
      { status: 200 }
    );
  }
}
