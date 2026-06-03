import mongoose from "mongoose";
import Expense from "../models/expenseModel.js";
import { createExpenseSchema } from "../validations/expensesValidation.js";

export const createExpense = async (req, res) => {
  try {
    const parseResult = createExpenseSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(e => e.message);
      return res.status(400).json({ message: errorMessages.join(", ") });
    }

    const { category, amount, date, status = "unpaid" } = parseResult.data;
    const userId = req.user?._id;

    const inputDate = date ? new Date(date) : new Date();
    const normalizedDate = new Date(inputDate.toISOString().split("T")[0]);

    const month = normalizedDate.getMonth() + 1;
    const year = normalizedDate.getFullYear();

    const existing = await Expense.findOne({
      category: category.toLowerCase(),
      month,
      year,
    });

    if (existing) {
      existing.amount += parseFloat(amount);
      const updated = await existing.save();
      return res.status(200).json({
        message: "Expense amount updated for the current month.",
        data: {
          ...updated.toObject(),
          date: updated.date.toISOString().split("T")[0], 
        },
      });
    }

    const newExpense = new Expense({
      category: category.toLowerCase(),
      amount,
      month,
      year,
      date: normalizedDate,
      created: userId,
      status,
    });

    const savedExpense = await newExpense.save();

    res.status(201).json({
      message: "Expense created for the current month.",
      data: {
        ...savedExpense.toObject(),
        date: savedExpense.date.toISOString().split("T")[0], 
      },
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      message: "Something went wrong while creating the expense.",
      error: error.message,
    });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, perPage = 10 } = req.query;
    const matchStage = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const expenses = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            category: "$category",
            month: "$month",
            year: "$year",
          },
          totalAmount: { $sum: "$amount" },
          expenseId: { $first: "$_id" },
          status: { $first: "$status" },
          date: { $first: "$date" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $project: {
          _id: "$expenseId",
          category: "$_id.category",
          month: "$_id.month",
          year: "$_id.year",
          totalAmount: 1,
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          year: -1,
          month: -1,
          category: 1,
        },
      },
    ]);

    const grouped = {};
    let grandTotal = 0;

    for (const item of expenses) {
      const key = `${item.year}-${String(item.month).padStart(2, "0")}`;

      if (!grouped[key]) {
        grouped[key] = {
          total: 0,
          items: [],
        };
      }

      grouped[key].items.push(item);
      grouped[key].total += item.totalAmount;
      grandTotal += item.totalAmount;
    }

    const groupedArray = Object.entries(grouped).map(([monthKey, value]) => ({
      monthKey,
      total: value.total,
      items: value.items,
    }));

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(perPage);
    const totalGroups = groupedArray.length;
    const totalPages = Math.ceil(totalGroups / itemsPerPage);
    const paginatedData = groupedArray.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const totalPurchaseResult = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalPurchaseAmount = totalPurchaseResult[0]?.totalAmount || 0;
    const totalPurchaseCount = totalPurchaseResult[0]?.count || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPurchaseResult = await Expense.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          todayPurchaseAmount: { $sum: "$amount" },
        },
      },
    ]);

    const todayPurchaseAmount = todayPurchaseResult[0]?.todayPurchaseAmount || 0;

    res.status(200).json({
      message: "Expenses grouped by month fetched successfully.",
      data: paginatedData,
      pagination: {
        currentPage,
        perPage: itemsPerPage,
        totalPages,
        totalGroups,
      },
      grandTotal,
      totalAmount: grandTotal,
      totalPurchaseAmount,
      totalPurchaseCount,
      todayPurchaseAmount,
    });
  } catch (error) {
    console.error("Error fetching grouped expenses:", error);
    res.status(500).json({
      message: "Something went wrong while fetching grouped expenses.",
      error: error.message,
    });
  }
};


export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const amount = parseFloat(req.body.amount);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID." });
    }

    if (status && !["paid", "unpaid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'paid' or 'unpaid'." });
    }

    if (Number.isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount." });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    expense.amount = amount;

    if (status) {
      expense.status = status;
    }

    const currentDate = new Date();
    const normalizedDate = new Date(currentDate.toISOString().split("T")[0]);
    expense.date = normalizedDate;

    const updatedExpense = await expense.save();

    return res.status(200).json({
      message: "Expense updated successfully.",
      data: {
        ...updatedExpense.toObject(),
        date: updatedExpense.date.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({
      message: "Something went wrong while updating the expense.",
      error: error.message,
    });
  }
};


export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID." });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    return res.status(200).json({
      message: "Expense deleted successfully.",
      // data: deletedExpense,
    });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({
      message: "Something went wrong while deleting the expense.",
      error: error.message,
    });
  }
};
