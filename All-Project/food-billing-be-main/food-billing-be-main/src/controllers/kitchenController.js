import KitchenOrder from "../models/kitchenModel.js";

export const getKitchenOrders = async (req, res) => {
  try {
    const { status = "new" } = req.query;

    // Get orders from kitchen schema
    const kitchenOrders = await KitchenOrder.find({
      status: { $in: ["new", "update"] },
      branch: req.user.branch
    })
      .populate('branch', 'name')
      .populate('hotelBrand', 'name')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${kitchenOrders.length} kitchen orders`);

    // Transform with proper error handling
    const transformedOrders = kitchenOrders.map(order => {
      // Ensure foods and originalFoods are arrays
      const foods = Array.isArray(order.foods) ? order.foods : [];
      const originalFoods = Array.isArray(order.originalFoods) ? order.originalFoods : [];

      // Create a set of original food names for quick lookup
      const originalFoodNames = new Set();
      originalFoods.forEach(food => {
        originalFoodNames.add(food.name);
      });

      // Separate foods into new and updated sections correctly
      const newFoods = foods.filter(food => {
        // "new" section should only contain original foods from first order
        return food.foodType === "new" && originalFoodNames.has(food.name);
      });

      const updatedFoods = foods.filter(food => {
        return food.foodType === "updated" || 
               (food.foodType === "new" && !originalFoodNames.has(food.name));
      });

      return {
        _id: order._id,
        orderId: order.orderId,
        customerName: order.customerName,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        foods: {
          new: newFoods,
          updated: updatedFoods
        },
        foodHistory: {
          originalFoods: originalFoods,
          totalNewItems: newFoods.length,
          totalUpdatedItems: updatedFoods.length
        }
      };
    });

    res.status(200).json({
      success: true,
      orders: transformedOrders
    });

  } catch (error) {
    console.error("Kitchen orders fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch kitchen orders"
    });
  }
};
export const createKitchenOrder = async (order) => {
  try {
    const foods = Array.isArray(order.foods) ? order.foods : [];
    
    const kitchenOrderData = {
      orderId: order._id,
      customerName: order.customerName || "Walk-in Customer",
      branch: order.branch,
      hotelBrand: order.hotelBrand,
      status: "new",
      foods: foods.map(food => ({
        name: food.name || "Unknown Food",
        quantity: food.quantity || 1,
        foodType: "new"
      })),
      originalFoods: foods.map(food => ({
        name: food.name || "Unknown Food",
        quantity: food.quantity || 1,
        status: "pending"
      }))
    };
    
    const kitchenOrder = await KitchenOrder.create(kitchenOrderData);
    
    console.log("Kitchen order created with status: new");
    return kitchenOrder;
  } catch (error) {
    console.error("Error creating kitchen order:", error);
    throw error;
  }
};

export const updateKitchenOrder = async (order) => {
  try {
    const kitchenOrder = await KitchenOrder.findOne({ orderId: order._id });
    
    if (!kitchenOrder) {
      console.log("Kitchen order not found for order:", order._id);
      return null;
    }

    const currentFoods = Array.isArray(kitchenOrder.foods) ? kitchenOrder.foods : [];
    const originalFoods = Array.isArray(kitchenOrder.originalFoods) ? kitchenOrder.originalFoods : [];
    const orderFoods = Array.isArray(order.foods) ? order.foods : [];

    // Store current foods before update
    const previousFoods = [...currentFoods];
    
    // Update kitchen order fields
    kitchenOrder.customerName = order.customerName || "Walk-in Customer";
    kitchenOrder.status = "update";

    // Create maps for efficient lookup
    const originalFoodMap = new Map();
    originalFoods.forEach(food => {
      originalFoodMap.set(food.name, food.quantity);
    });

    // Calculate quantity differences
    const orderFoodQuantityMap = new Map();
    orderFoods.forEach(food => {
      const foodName = food.name || "Unknown Food";
      const quantity = food.quantity || 1;
      orderFoodQuantityMap.set(foodName, quantity);
    });

    // Prepare the updated foods array
    const updatedFoods = [];

    // Keep original foods in "new" section
    originalFoods.forEach(originalFood => {
      const foodName = originalFood.name;
      const originalQuantity = originalFood.quantity;
      
      updatedFoods.push({
        name: foodName,
        quantity: originalQuantity,
        foodType: "new"
      });
    });

    // Process all foods from the updated order for "updated" section
    orderFoods.forEach(food => {
      const foodName = food.name || "Unknown Food";
      const quantity = food.quantity || 1;
      const isOriginalFood = originalFoodMap.has(foodName);
      
      if (isOriginalFood) {
        // This is an original food with additional quantity
        const originalQuantity = originalFoodMap.get(foodName);
        const additionalQuantity = quantity - originalQuantity;
        
        if (additionalQuantity > 0) {
          updatedFoods.push({
            name: foodName,
            quantity: additionalQuantity,
            foodType: "updated"
          });
        }
      } else {
        // This is a completely new food added in update - put in "updated" section with foodType: "new"
        updatedFoods.push({
          name: foodName,
          quantity: quantity,
          foodType: "new"
        });
      }
    });

    kitchenOrder.foods = updatedFoods;
    kitchenOrder.markModified('foods');
    await kitchenOrder.save();
    
    console.log("Kitchen order updated with proper section placement");
    
    // Transform for response - separate into new and updated sections
    const newFoods = updatedFoods.filter(food => {
      // "new" section should only contain original foods
      const isOriginalFood = originalFoodMap.has(food.name);
      return food.foodType === "new" && isOriginalFood;
    });
    
    const updatedFoodItems = updatedFoods.filter(food => {
      // "updated" section should contain:
      // 1. Additional quantities of original foods (foodType: "updated")
      // 2. Completely new foods from updated order (foodType: "new" but not in original)
      const isOriginalFood = originalFoodMap.has(food.name);
      return food.foodType === "updated" || (food.foodType === "new" && !isOriginalFood);
    });

    return {
      kitchenOrder,
      previousFoods,
      updatedFoods: updatedFoods,
      newFoods: newFoods || [],
      updatedFoodItems: updatedFoodItems || []
    };
  } catch (error) {
    console.error("Error updating kitchen order:", error);
    throw error;
  }
};

export const deleteKitchenOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await KitchenOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Kitchen order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kitchen order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting kitchen order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete kitchen order",
    });
  }
};

export const deleteAllKitchenOrders = async (req, res) => {
  try {
    const result = await KitchenOrder.deleteMany();

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} kitchen orders deleted`,
    });
  } catch (error) {
    console.error("Error deleting all kitchen orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete kitchen orders",
    });
  }
};

