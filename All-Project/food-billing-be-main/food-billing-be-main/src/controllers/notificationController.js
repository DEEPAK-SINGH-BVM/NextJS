// controllers/notificationController.js
import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";

// Create notification helper function
export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for a branch/hotel
export const getNotifications = async (req, res) => {
  try {
    console.log("Get notifications called by user:", req.user.id);

    const {
      page = 1,
      limit = 20,
      read,
      type,
      startDate,
      endDate,
    } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageLimit = Math.max(parseInt(limit) || 20, 1);
    const skip = (pageNumber - 1) * pageLimit;

    // Build filters based on user role
    const filters = {};
    console.log("User role:", req.user.role);
    console.log("User branch:", req.user.branch);
    console.log("User hotelBrand:", req.user.hotelBrand);

    // Role-based filtering
    if (req.user.role === "branch-admin") {
      filters.branch = req.user.branch;
    } else if (req.user.role === "admin") {
      filters.hotelBrand = req.user.hotelBrand;
    }

    console.log("Filters before additional:", filters);

    // Additional filters
    if (read !== undefined) {
      filters.isRead = read === "true";
    }
    if (type) {
      filters.type = type;
    }
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);
      }
    }

    console.log("Final filters:", JSON.stringify(filters, null, 2));

    // Test database connection first
    const testConnection = await Notification.findOne();
    console.log("Database connection test:", testConnection ? "Connected" : "No documents");

    const [notifications, totalCount] = await Promise.all([
      Notification.find(filters)
        .populate("orderId", "orderId totalPrice orderType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Notification.countDocuments(filters),
    ]);

    console.log(`Found ${notifications.length} notifications`);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      ...filters,
      isRead: false,
    });

    console.log(`Unread count: ${unreadCount}`);

    res.status(200).json({
      success: true,
      notifications,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageLimit),
      totalCount,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch notifications",
      details: error.message 
    });
  }
};

// Mark notification as read - FIXED VERSION
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Mark as read called for notification:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid notification ID" 
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: "Notification not found" 
      });
    }

    console.log("Notification marked as read:", id);
    res.status(200).json({ 
      success: true,
      message: "Notification marked as read", 
      notification 
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to mark notification as read" 
    });
  }
};

// Mark all notifications as read - FIXED VERSION
export const markAllAsRead = async (req, res) => {
  try {
    console.log("Mark all as read called");
    
    const filters = { isRead: false };

    if (req.user.role === "branch-admin") {
      filters.branch = req.user.branch;
    } else if (req.user.role === "admin") {
      filters.hotelBrand = req.user.hotelBrand;
    }

    console.log("Mark all filters:", filters);

    const result = await Notification.updateMany(
      filters,
      { isRead: true }
    );

    console.log("Mark all result:", result);

    res.status(200).json({ 
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to mark all notifications as read" 
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete notification called:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid notification ID" 
      });
    }

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: "Notification not found" 
      });
    }

    console.log("Notification deleted:", id);
    res.status(200).json({ 
      success: true,
      message: "Notification deleted successfully" 
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete notification" 
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    console.log("Get notification stats called");
    
    const filters = {};

    if (req.user.role === "branch-admin") {
      filters.branch = req.user.branch;
    } else if (req.user.role === "admin") {
      filters.hotelBrand = req.user.hotelBrand;
    }

    console.log("Stats filters:", filters);

    const stats = await Notification.aggregate([
      { $match: filters },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
          }
        }
      }
    ]);

    const totalUnread = await Notification.countDocuments({
      ...filters,
      isRead: false,
    });

    console.log("Stats result:", { stats, totalUnread });

    res.status(200).json({
      success: true,
      stats,
      totalUnread,
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch notification statistics" 
    });
  }
};

// Delete all notifications - NEW API
export const deleteAllNotifications = async (req, res) => {
  try {
    console.log("Delete all notifications called");

    const filters = {};

    // Role-based access control
    if (req.user.role === "branch-admin") {
      filters.branch = req.user.branch;
    } else if (req.user.role === "admin") {
      filters.hotelBrand = req.user.hotelBrand;
    }

    console.log("Delete all filters:", filters);

    const result = await Notification.deleteMany(filters);

    console.log("Delete all result:", result);

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete all notifications",
    });
  }
};
