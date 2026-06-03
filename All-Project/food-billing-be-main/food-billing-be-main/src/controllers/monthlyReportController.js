
import Material from "../models/rawMaterialStock.js";
import Order from "../models/orderSchema.js";
import DailyReport from "../models/monthlyreportModel.js";
import Expense from "../models/expenseModel.js";
import XLSX from "xlsx";
import { Readable } from "stream";
import bestSellingDishModal from "../models/bestSellingDishModal.js";
import paymentMethodTrendModal from "../models/paymentMethodTrendModal.js";
import ProfitLossSummary from "../models/profitLossSummary.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const { startDate, endDate, exportExcel, search } = req.query;

    // Validate and prepare date range
    let dateRange = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: "Invalid date range" });
      }
      dateRange = { start, end };
    }

    // Aggregate monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalExpense: { $sum: "$amount" },
        },
      },
    ]);

    const expenseMap = Object.fromEntries(
      monthlyExpenses.map(({ _id, totalExpense }) => [
        `${_id.year}-${String(_id.month).padStart(2, "0")}`,
        totalExpense,
      ])
    );

    // Fetch materials (only food category) and orders
    const baseFilter = { createdBy: userId };
    const materialFilter = { ...baseFilter, category: "food" }; // Only food items
    const orderFilter = { ...baseFilter };

    if (dateRange) {
      materialFilter.createdAt = orderFilter.createdAt = {
        $gte: dateRange.start,
        $lte: dateRange.end,
      };
    }

    const [materials, orders] = await Promise.all([
      Material.find(materialFilter),
      Order.find(orderFilter).lean(),
    ]);

    // Group items by date
    const groupedByDate = {};

    const groupItems = (items, key) => {
      for (const item of items) {
        const dateStr = item.createdAt.toISOString().slice(0, 10);
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = { materials: [], orders: [] };
        }
        groupedByDate[dateStr][key].push(item);
      }
    };

    groupItems(materials, "materials");
    groupItems(orders, "orders");

    // Build daily reports
    const reports = [];

    // Initialize totals
    let totalSale = 0;
    let totalPurchase = 0;

    for (const dateStr of Object.keys(groupedByDate).sort()) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;

      const monthlyExpenseTotal = expenseMap[monthKey] || 0;
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyExpenseTotal = Math.trunc(monthlyExpenseTotal / daysInMonth);

      const { materials: dayMaterials, orders: dayOrders } = groupedByDate[dateStr];

      // Calculate purchase (only from food materials)
      const purchasePrice = dayMaterials.reduce((sum, m) => sum + (m.amount || 0), 0);
      // Remove purchaseCancel and purchaseTotal calculations

      let salePrice = 0;
      let saleCancel = 0;

      for (const order of dayOrders) {
        for (const { price = 0, quantity = 0 } of order.foods) {
          const total = price * quantity;
          if (["Cancel", "Cancel & Refund"].includes(order.status)) {
            saleCancel += total;
          } else {
            salePrice += total;
          }
        }
      }

      const saleTotal = salePrice + saleCancel;

      // Add to global totals
      totalSale += saleTotal;
      totalPurchase += purchasePrice;

      let profit = 0;
      let loss = 0;
      let remark = "Equal";

      if (saleTotal > purchasePrice) {
        profit = saleTotal - purchasePrice;
        remark = "Profit";
      } else if (purchasePrice > saleTotal) {
        loss = purchasePrice - saleTotal;
        remark = "Loss";
      }

      reports.push({
        day: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        reportDate: date,
        name: "Daily Summary",
        purchasePrice, // This now represents food purchases only
        salePrice,
        saleCancel,
        saleTotal,
        profit,
        loss,
        remark,
        monthlyExpenseTotal,
        dailyExpenseTotal,
        createdBy: userId,
      });
    }

    // Upsert reports
    const bulkOps = reports.map((report) => ({
      updateOne: {
        filter: { reportDate: report.reportDate, createdBy: userId },
        update: { $set: report },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await DailyReport.bulkWrite(bulkOps);
    }

    // Query for final report retrieval
    const reportQuery = { createdBy: userId };

    if (dateRange) {
      reportQuery.reportDate = { $gte: dateRange.start, $lte: dateRange.end };
    }

    if (search) {
      const regex = new RegExp(search, "i");
      reportQuery.$or = [
        { remark: regex },
        { day: regex },
        { name: regex },
      ];
    }

    const allReports = await DailyReport.find(reportQuery).sort({ reportDate: -1 });

    // Recalculate totalSale and totalPurchase only for filtered reports
    const filteredTotalSale = allReports.reduce((sum, r) => sum + r.saleTotal, 0);
    const filteredTotalPurchase = allReports.reduce((sum, r) => sum + r.purchasePrice, 0);

    // Excel Export - Updated to remove unwanted columns
    if (exportExcel === "true") {
      const formatted = allReports.map((r) => ({
        Date: r.reportDate.toISOString().slice(0, 10),
        Purchase: r.purchasePrice, // Only food purchases
        Sale: r.salePrice,
        "Sale Cancel": r.saleCancel,
        "Sale Total": r.saleTotal,
        "Total Expense": r.dailyExpenseTotal,
        Profit: r.profit,
        Loss: r.loss,
        Remark: r.remark,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Reports");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Disposition", "attachment; filename=Monthly_Report.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      return Readable.from(buffer).pipe(res);
    }

    // Pagination
    const total = allReports.length;
    const paginated = allReports.slice(skip, skip + perPage);

    return res.status(200).json({
      message: "Daily reports generated successfully",
      data: paginated,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      totalSale: filteredTotalSale,
      totalPurchase: filteredTotalPurchase,
    });

  } catch (error) {
    console.error("Error generating daily reports:", error);
    res.status(500).json({
      message: "Failed to generate daily reports",
      error: error.message,
    });
  }
};

export const getBestSellingDishes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build match query with optional date filter
    const match = { createdBy: userId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(new Date(endDate).getTime() + 86400000); // Include full end date
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: "Invalid date range" });
      }
      match.createdAt = { $gte: start, $lt: end };
    }

    // Aggregate best selling dishes from Orders
    const dishSales = await Order.aggregate([
      { $match: match },
      { $unwind: "$foods" },
      {
        $group: {
          _id: {
            name: "$foods.name",
            price: "$foods.price",
          },
          totalSale: { $sum: "$foods.quantity" },
        },
      },
      { $sort: { totalSale: -1 } },
      { $limit: 5 },
    ]);

    const totalQuantity = dishSales.reduce((sum, dish) => sum + dish.totalSale, 0);

    const bestSelling = totalQuantity === 0
      ? []
      : dishSales.map(({ _id: { name, price }, totalSale }) => ({
        dishName: name,
        dishPrice: price,
        totalSale,
        salePercentage: parseFloat(((totalSale / totalQuantity) * 100).toFixed(2)),
      }));

    // Save to BestSellingDish collection (if data exists)
    if (bestSelling.length > 0) {
      const day = new Date().toISOString().split("T")[0]; // Format: "YYYY-MM-DD"

      // Remove existing entries for today and user to avoid duplicates
      await bestSellingDishModal.deleteMany({ createdBy: userId, day });

      // Prepare documents for insertion
      const insertData = bestSelling.map(dish => ({
        name: dish.dishName,
        totalSold: dish.totalSale,
        revenue: dish.dishPrice * dish.totalSale,
        day,
        createdBy: userId,
      }));

      // Insert into the database
      await bestSellingDishModal.insertMany(insertData);
    }

    return res.status(200).json({
      message: "Best selling dishes fetched successfully",
      bestSellingDishes: bestSelling,
    });
  } catch (error) {
    console.error("Error fetching best selling dishes:", error);
    res.status(500).json({
      message: "Failed to fetch best selling dishes",
      error: error.message,
    });
  }
};

export const getPaymentMethodsSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let match = { createdBy: userId };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(new Date(endDate).getTime() + 86400000),
      };
    }

    const paymentTrendsRaw = await Order.aggregate([
      { $match: match },
      { $unwind: "$foods" },
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "pending PaymentData"] },  // default null/undefined to "pendingPaymentData"
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $multiply: ["$foods.price", "$foods.quantity"],
            },
          },
        },
      },
      {
        $project: {
          method: "$_id",
          count: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalCount = paymentTrendsRaw.reduce((sum, item) => sum + item.count, 0);

    const paymentTrends = totalCount === 0
      ? []
      : paymentTrendsRaw.map((item) => ({
        ...item,
        paymentPercentage: parseFloat(((item.count / totalCount) * 100).toFixed(2)),
      }));

    const day = new Date().toISOString().slice(0, 10);

    await paymentMethodTrendModal.deleteMany({ createdBy: userId, day });

    const savePromises = paymentTrendsRaw.map(item => {
      return new paymentMethodTrendModal({
        method: item.method,
        count: item.count,
        totalAmount: item.totalAmount,
        day,
        createdBy: userId,
      }).save();
    });

    await Promise.all(savePromises);

    res.status(200).json({
      message: "Payment method trends fetched and saved successfully",
      paymentMethods: paymentTrends,
    });
  } catch (error) {
    console.error("Error fetching payment methods summary:", error);
    res.status(500).json({
      message: "Failed to fetch payment methods summary",
      error: error.message,
    });
  }
};


export const getProfitLossSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    let { startDate, endDate, perPage = 25, page = 1, search = "", filter = "" } = req.query;

    const itemsPerPage = parseInt(perPage, 10) || 25;
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    const searchTerm = search.trim().toLowerCase();

    const currentDate = new Date();
    let customStartDate, customEndDate;

    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];

    if (filter) {
      const filterLower = filter.toLowerCase();
      switch (filterLower) {
        case "yesterday":
          customStartDate = new Date(currentDate);
          customStartDate.setDate(currentDate.getDate() - 1);
          customEndDate = new Date(customStartDate);
          break;

        case "lastweek":
          customStartDate = new Date(currentDate);
          customStartDate.setDate(currentDate.getDate() - currentDate.getDay() - 7);
          customEndDate = new Date(customStartDate);
          customEndDate.setDate(customEndDate.getDate() + 6);
          break;

        case "currentmonth":
          customStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          customEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;

        case "previousmonth":
          customStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          customEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
          break;

        default:
          const monthIndex = monthNames.indexOf(filterLower);
          if (monthIndex !== -1) {
            customStartDate = new Date(currentDate.getFullYear(), monthIndex, 1);
            customEndDate = new Date(currentDate.getFullYear(), monthIndex + 1, 0);
          }
          break;
      }
    }

    // Match conditions for both DailyReport and Material
    const matchCondition = { createdBy: userId };
    if (customStartDate && customEndDate) {
      matchCondition.reportDate = {
        $gte: new Date(customStartDate.setHours(0, 0, 0, 0)),
        $lte: new Date(customEndDate.setHours(23, 59, 59, 999))
      };
      matchCondition.createdAt = {
        $gte: new Date(customStartDate.setHours(0, 0, 0, 0)),
        $lte: new Date(customEndDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      matchCondition.reportDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // ✅ Get sales data from DailyReport
    const salesSummary = await DailyReport.aggregate([
      { $match: { createdBy: userId, ...(matchCondition.reportDate && { reportDate: matchCondition.reportDate }) } },
      {
        $group: {
          _id: {
            year: { $year: "$reportDate" },
            month: { $month: "$reportDate" }
          },
          totalSale: { $sum: "$saleTotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // ✅ Get purchase and expense data from Material model
    const materialSummary = await Material.aggregate([
      { $match: { createdBy: userId, ...(matchCondition.createdAt && { createdAt: matchCondition.createdAt }) } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          purchaseCount: {
            $sum: {
              $cond: [{ $eq: ["$category", "food"] }, 1, 0]
            }
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ["$category", "expense"] }, 1, 0]
            }
          },
          totalPurchase: { // This is food amount (purchase)
            $sum: {
              $cond: [{ $eq: ["$category", "food"] }, "$amount", 0]
            }
          },
          totalExpenses: { // This is expense amount
            $sum: {
              $cond: [{ $eq: ["$category", "expense"] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Combine sales data with purchase/expense data
    const monthlyResults = salesSummary.map(salesItem => {
      const { year, month } = salesItem._id;
      
      // Find corresponding material data for this month
      const materialData = materialSummary.find(m => 
        m._id.year === year && m._id.month === month
      );

      const totalSale = salesItem.totalSale || 0;
      const totalPurchase = materialData?.totalPurchase || 0; // Use material purchase (food)
      const totalExpenses = materialData?.totalExpenses || 0; // Use material expense

      const grossProfit = totalSale - totalPurchase;
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalSale ? ((netProfit / totalSale) * 100).toFixed(2) + "%" : "0.00%";

      const formattedDate = new Date(year, month - 1, 1);
      const day = formattedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      });

      return {
        year,
        month,
        day,
        totalSale,
        totalPurchase, // This now comes from Material (food)
        totalExpenses, // This now comes from Material (expense)
        grossProfit,
        netProfit,
        status: netProfit >= 0 ? "Profit" : "Loss",
        profitMargin,
        purchaseCount: materialData?.purchaseCount || 0,
        expenseCount: materialData?.expenseCount || 0
      };
    });

    // Also include months that have only material data but no sales data
    materialSummary.forEach(materialItem => {
      const { year, month } = materialItem._id;
      const exists = monthlyResults.find(item => item.year === year && item.month === month);
      
      if (!exists) {
        const totalSale = 0;
        const totalPurchase = materialItem.totalPurchase || 0;
        const totalExpenses = materialItem.totalExpenses || 0;

        const grossProfit = totalSale - totalPurchase;
        const netProfit = grossProfit - totalExpenses;
        const profitMargin = "0.00%";

        const formattedDate = new Date(year, month - 1, 1);
        const day = formattedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long"
        });

        monthlyResults.push({
          year,
          month,
          day,
          totalSale,
          totalPurchase,
          totalExpenses,
          grossProfit,
          netProfit,
          status: netProfit >= 0 ? "Profit" : "Loss",
          profitMargin,
          purchaseCount: materialItem.purchaseCount || 0,
          expenseCount: materialItem.expenseCount || 0
        });
      }
    });

    // Sort monthly results
    monthlyResults.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Store summaries in DB
    const summariesToStore = monthlyResults.map(item => {
      const startOfMonth = new Date(item.year, item.month - 1, 1);
      const endOfMonth = new Date(item.year, item.month, 0);

      return {
        createdBy: userId,
        branch: req.user?.branch || req.body?.branch || req.query?.branch || "Default Branch",
        hotelBrand: req.user?.hotelBrand || req.body?.hotelBrand || req.query?.hotelBrand || "Default Brand",
        year: item.year,
        month: item.month,
        startDate: startOfMonth,
        endDate: endOfMonth,
        totalSale: item.totalSale || 0,
        totalPurchase: item.totalPurchase || 0,
        totalExpenses: item.totalExpenses || 0,
        grossProfit: item.grossProfit || 0,
        netProfit: item.netProfit || 0,
        profitMargin: item.profitMargin || "0%",
        purchaseCount: item.purchaseCount || 0,
        expenseCount: item.expenseCount || 0
      };
    });

    if (summariesToStore.length > 0) {
      try {
        for (const summary of summariesToStore) {
          await ProfitLossSummary.findOneAndUpdate(
            {
              createdBy: summary.createdBy,
              year: summary.year,
              month: summary.month,
              branch: summary.branch,
              hotelBrand: summary.hotelBrand
            },
            summary,
            { upsert: true, new: true }
          );
        }
        console.log(`Successfully stored/updated ${summariesToStore.length} profit loss summaries`);
      } catch (bulkError) {
        console.error("Error storing profit loss summaries:", bulkError);
      }
    }

    // Filter by search
    const filteredResults = searchTerm
      ? monthlyResults.filter(item => item.day.toLowerCase().includes(searchTerm))
      : monthlyResults;

    const cleanFilteredResults = filteredResults.map(({ createdAt, updatedAt, __v, ...rest }) => rest);

    const paginatedResults = cleanFilteredResults.slice(skip, skip + itemsPerPage);
    const totalMonths = cleanFilteredResults.length;
    const totalPages = Math.ceil(totalMonths / itemsPerPage);

    // ✅ Yearly summary
    const yearlySales = await DailyReport.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: { year: { $year: "$reportDate" } },
          totalSale: { $sum: "$saleTotal" }
        }
      },
      { $sort: { "_id.year": 1 } }
    ]);

    const yearlyMaterial = await Material.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          purchaseCount: {
            $sum: {
              $cond: [{ $eq: ["$category", "food"] }, 1, 0]
            }
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ["$category", "expense"] }, 1, 0]
            }
          },
          totalPurchase: {
            $sum: {
              $cond: [{ $eq: ["$category", "food"] }, "$amount", 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$category", "expense"] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1 } }
    ]);

    const yearlyResults = yearlySales.map(salesItem => {
      const year = salesItem._id.year;
      const materialData = yearlyMaterial.find(m => m._id.year === year);

      const totalSale = salesItem.totalSale || 0;
      const totalPurchase = materialData?.totalPurchase || 0;
      const totalExpenses = materialData?.totalExpenses || 0;

      const grossProfit = totalSale - totalPurchase;
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalSale ? ((netProfit / totalSale) * 100).toFixed(2) + "%" : "0.00%";

      return {
        year,
        totalSale,
        totalPurchase,
        totalExpenses,
        grossProfit,
        netProfit,
        status: netProfit >= 0 ? "Profit" : "Loss",
        profitMargin,
        purchaseCount: materialData?.purchaseCount || 0,
        expenseCount: materialData?.expenseCount || 0
      };
    });

    // Include years with only material data
    yearlyMaterial.forEach(materialItem => {
      const year = materialItem._id.year;
      const exists = yearlyResults.find(item => item.year === year);
      
      if (!exists) {
        const totalSale = 0;
        const totalPurchase = materialItem.totalPurchase || 0;
        const totalExpenses = materialItem.totalExpenses || 0;

        const grossProfit = totalSale - totalPurchase;
        const netProfit = grossProfit - totalExpenses;
        const profitMargin = "0.00%";

        yearlyResults.push({
          year,
          totalSale,
          totalPurchase,
          totalExpenses,
          grossProfit,
          netProfit,
          status: netProfit >= 0 ? "Profit" : "Loss",
          profitMargin,
          purchaseCount: materialItem.purchaseCount || 0,
          expenseCount: materialItem.expenseCount || 0
        });
      }
    });

    // Sort yearly results
    yearlyResults.sort((a, b) => a.year - b.year);

    // ✅ Final response
    res.status(200).json({
      page: currentPage,
      perPage: itemsPerPage,
      totalMonths,
      totalPages,
      monthlyData: paginatedResults,
      yearlySummary: yearlyResults
    });

  } catch (error) {
    console.error("Error fetching profit & loss summary:", error);
    res.status(500).json({ message: "Failed to fetch P&L summary", error: error.message });
  }
};



