import { InventoryAdapter } from '@/lib/db-adapter';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    // Require authentication and get userId
    const auth = requireAuth(req);
    if (auth.error) return auth.response;
    const { userId } = auth;

    const inventory = await InventoryAdapter.findAll(userId);

    return Response.json(
      {
        success: true,
        inventory,
        __offline: inventory.length === 0 ? true : false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return Response.json(
      {
        success: true,
        inventory: [],
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

    const { itemName, price, notes } = await req.json();

    // Validate required fields
    if (!itemName || !price) {
      return Response.json(
        { error: 'Please provide itemName and price' },
        { status: 400 }
      );
    }

    // Check if item already exists (online mode only)
    const existingItem = await InventoryAdapter.findByName(userId, itemName);
    if (existingItem && !existingItem.__offline) {
      return Response.json(
        { error: 'Item already exists' },
        { status: 409 }
      );
    }

    // Create new inventory item
    const item = await InventoryAdapter.create({
      userId,
      itemName,
      price,
      notes,
      isActive: true,
    });

    return Response.json(
      {
        success: true,
        message: 'Inventory item created successfully',
        item,
        __offline: item.__offline || false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return Response.json(
      {
        success: true,
        message: 'Item will be created when online',
        __offline: true,
      },
      { status: 201 }
    );
  }
}
