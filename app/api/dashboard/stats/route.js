import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req) {
  try {
    await connectDB();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run 4 parallel aggregation pipelines
    const [salesData, purchaseData, assetsData, expensesData] = await Promise.all([
      // 1. Sales Summary: Match type: 'sale', group by mode (cash/udhar)
      Transaction.aggregate([
        {
          $match: {
            type: 'sale',
          },
        },
        {
          $group: {
            _id: '$mode',
            total: {
              $sum: '$netPayable',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // 2. Purchase Insights: Match type: 'purchase', group by mode
      Transaction.aggregate([
        {
          $match: {
            type: 'purchase',
          },
        },
        {
          $group: {
            _id: '$mode',
            total: {
              $sum: '$netPayable',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // 3. Liquid Assets: Match type in ['payment_in', 'payment_out'], group by type
      Transaction.aggregate([
        {
          $match: {
            type: {
              $in: ['payment_in', 'payment_out'],
            },
          },
        },
        {
          $group: {
            _id: '$type',
            total: {
              $sum: '$amount',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // 4. Daily Expenses: Match type: 'expense' AND createdAt between today's 00:00:00 and 23:59:59
      Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            createdAt: {
              $gte: today,
              $lt: tomorrow,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$amount',
            },
          },
        },
      ]),
    ]);

    // Process sales data
    const salesByMode = {};
    let salesTotalAmount = 0;
    salesData.forEach((item) => {
      salesByMode[item._id] = item.total;
      salesTotalAmount += item.total;
    });

    const sales = {
      cash: salesByMode.cash || 0,
      udhar: salesByMode.udhar || 0,
      total: salesTotalAmount,
    };

    // Process purchase data
    const purchaseByMode = {};
    let purchaseTotalAmount = 0;
    purchaseData.forEach((item) => {
      purchaseByMode[item._id] = item.total;
      purchaseTotalAmount += item.total;
    });

    const purchases = {
      cash: purchaseByMode.cash || 0,
      udhar: purchaseByMode.udhar || 0,
      total: purchaseTotalAmount,
    };

    // Process assets data
    let inflow = 0;
    let outflow = 0;
    assetsData.forEach((item) => {
      if (item._id === 'payment_in') {
        inflow = item.total;
      } else if (item._id === 'payment_out') {
        outflow = item.total;
      }
    });

    const assets = {
      inflow,
      outflow,
      net: inflow - outflow,
    };

    // Process expenses data
    const expenses = {
      daily: expensesData.length > 0 ? expensesData[0].total : 0,
    };

    return Response.json(
      {
        sales,
        purchases,
        assets,
        expenses,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return Response.json(
      {
        error: 'Failed to fetch dashboard statistics',
        message: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
