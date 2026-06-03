import Material from "../models/rawMaterialStock.js";

export const getStockConsumptions = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "createdAt",
      order = "desc",
      per_page,
      page,
      status,
    } = req.query;

    const currentPage = parseInt(page, 10) || 1;
    const limit = parseInt(per_page, 10) || 25;
    const skip = (currentPage - 1) * limit;
    const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

    // Fetch all materials
    const allMaterials = await Material.find().lean();

    // Build report for each material
    const stockReport = allMaterials.map((item) => {
      const stockLevel = item.stockLevel || 0;
      const consumed = item.consumed || 0;
      const currentStock = stockLevel - consumed;

      let statusValue = "In Stock";
      if (currentStock <= 0) {
        statusValue = "Out of Stock";
      } else if (stockLevel > 0 && currentStock / stockLevel <= 0.25) {
        statusValue = "Low Stock";
      }

      return {
        itemName: item.name,
        consumed,
        cost: item.cost || 0,
        mainstock: stockLevel,
        currentStock,
        status: statusValue,
        unit: item.stockLevelUnit || "Piece",
        createdAt: item.createdAt,
      };
    });

    // Calculate totals
    const totalCost = stockReport.reduce((sum, item) => sum + item.cost, 0);
    const lowStockCount = stockReport.filter((i) => i.status === "Low Stock").length;
    const outOfStockCount = stockReport.filter((i) => i.status === "Out of Stock").length;

    // Filtering by search and status
    let filtered = stockReport;

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.itemName.toLowerCase().includes(keyword)
      );
    }

    if (status) {
      filtered = filtered.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    const totalStock = filtered.length;

    // Sorting
    if (sortBy === "createdAt") {
      filtered.sort((a, b) => sortOrder * (new Date(a.createdAt) - new Date(b.createdAt)));
    }

    // Pagination
    const paginated = filtered.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalStock / limit);

    return res.status(200).json({
      message: "Filtered raw items",
      reports: paginated,
      currentPage,
      totalPages,
      totalStock,
      totalCost,
      lowStockCount,
      outOfStockCount,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching the raw items.",
      error: error.message,
    });
  }
};
