import dashboardModel from "../models/dashboardModal.js"; // Dashboard schema model
import moment from 'moment';
import Order from "../models/orderSchema.js"; // Order schema model

export const getDashboardSummary = async (req, res) => {
  try {
    // Query params
    const {
      page = 1,
      per_page = 10,
      search = '',
      type = 'today' // 'today' or 'month' for paginated data
    } = req.query;

    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    const startOfToday = moment().startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Reusable summary logic
const getSummary = async (startDate, endDate) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$orderType',
        totalOrders: { $sum: 1 },
        totalSales: { $sum: '$totalPrice' }
      }
    }
  ]);

  let totalOrders = 0;
  let totalSales = 0;
  let dineInOrders = 0;
  let takeHomeOrders = 0;

  for (const item of result) {
    totalOrders += item.totalOrders;
    totalSales += item.totalSales;

    const type = item._id?.toLowerCase();
    if (type === 'dine-in') dineInOrders += item.totalOrders;
    if (type === 'take-home' || type === 'delivery') takeHomeOrders += item.totalOrders;
  }

  return { totalOrders, totalSales, dineInOrders, takeHomeOrders };
};

    // Get summary data
    const today = await getSummary(startOfToday, endOfToday);
    const month = await getSummary(startOfMonth, endOfMonth);

    // Store the dashboard summary in the dashboard collection
    const dashboardData = new dashboardModel({
      orderType: 'summary', // You can set an appropriate order type here
      totalAmount: today.totalSales, // You can store specific data as needed
      createdAt: new Date() // Store the date the summary was created
    });

    // Save the dashboard summary document
    await dashboardData.save();

    // ===== Paginated order list (optional) =====
    let listFilter = {};
    if (type === 'today') {
      listFilter.createdAt = { $gte: startOfToday, $lte: endOfToday };
    } else if (type === 'month') {
      listFilter.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (search) {
      listFilter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, totalOrdersCount] = await Promise.all([
      Order.find(listFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(listFilter)
    ]);

    return res.json({
      today,
      month,
      paginatedOrders: {
        currentPage: parseInt(page),
        perPage: limit,
        totalOrders: totalOrdersCount,
        totalPages: Math.ceil(totalOrdersCount / limit),
        orders
      }
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
