import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Order from "../models/orderSchema.js";
import Invoice from "../models/invoiceModel.js";

const ERRORS = {
  MISSING_TOKEN: "Unauthorized: Missing or invalid token",
  INVALID_TOKEN: "Unauthorized: Invalid token",
  USER_NOT_FOUND: "Unauthorized: User not found",
};

// Define status labels mapping with your specified names
const STATUS_LABELS_MAP = {
  "Processing": "Processing",
  "Served": "Served", 
  "Paid-Completed": "Paid & Completed",
  "Cancel": "Cancel",
  "Cancel-Refund": "Cancel & Refund"
};

export const getInvoices = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      paymentMethod,
      statusLabel,
      page = 1,
      perPage = 10,
    } = req.query;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: ERRORS.MISSING_TOKEN });
    }

    let userData;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userData = await User.findById(decoded.id);

      if (!userData) {
        return res.status(401).json({ error: ERRORS.USER_NOT_FOUND });
      }
    } catch (err) {
      return res.status(401).json({ error: ERRORS.INVALID_TOKEN });
    }

    // Build base filter for orders based on user role
    let orderFilter = {};
    if (userData.role === "branch-admin") {
      orderFilter.branch = userData.branch;
    } else if (userData.role === "admin") {
      orderFilter.hotelBrand = userData.hotelBrand;
    }

    // Apply status filter to orders if provided
    if (statusLabel) {
      const mappedStatus = STATUS_LABELS_MAP[statusLabel];
      
      if (!mappedStatus) {
        return res.status(400).json({ 
          error: "Invalid status label value",
          validStatusLabels: Object.keys(STATUS_LABELS_MAP)
        });
      }
      orderFilter.status = mappedStatus;
    }

    // Get order IDs based on filters
    const branchOrders = await Order.find(orderFilter).select('_id');
    const orderIds = branchOrders.map(order => order._id);

    // Build invoice filters
    const invoiceFilters = {
      orderId: { $in: orderIds }
    };

    // Date filter
    if (startDate && endDate) {
      invoiceFilters.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      invoiceFilters.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      invoiceFilters.date = { $lte: new Date(endDate) };
    }

    // Payment method filter
    if (paymentMethod) {
      invoiceFilters.paymentMethod = paymentMethod;
    }

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(perPage, 10);

    // Get total count and invoices with pagination
    const totalCount = await Invoice.countDocuments(invoiceFilters);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const invoices = await Invoice.find(invoiceFilters)
      .select('orderId invoiceNumber customerName amount paymentMethod date')
      .populate({
        path: 'orderId',
        select: 'status orderType',
        match: orderFilter
      })
      .sort({ date: -1 })
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    // Process invoices with status from populated order
    const invoicesWithStatus = invoices.map(invoice => {
      const order = invoice.orderId;
      return {
        _id: invoice._id,
        orderId: invoice.orderId?._id || invoice.orderId,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        amount: invoice.amount,
        paymentMethod: invoice.paymentMethod,
        date: invoice.date,
        status: order?.status || 'Unknown',
        orderType: order?.orderType || 'Unknown'
      };
    });

    res.status(200).json({
      invoices: invoicesWithStatus,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        perPage: itemsPerPage,
      },
    });

  } catch (error) {
    console.error("Invoice retrieval error:", error);
    res.status(500).json({ error: error.message });
  }
};