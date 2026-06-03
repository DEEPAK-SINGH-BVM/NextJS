export const ERRORS = {
    MISSING_FIELDS:
      "Missing required fields: totalPrice, paymentMethod, customerName, number, foods, or orderType",
    INVALID_DELIVERY_ADDRESS: "Delivery address is required for delivery orders",
    INVALID_FOOD_ITEM: "Each food must have a name, price, and quantity",
    INVALID_QUANTITY: "Food quantity must be at least 1",
    INVALID_TABLE_TYPE: "Table must be a number for dine-in orders",
    TABLE_NOT_FOUND: (num) => `Table with number ${num} not found`,
    TABLE_OCCUPIED: "Table is already occupied",
    INVALID_TOKEN: "Unauthorized: Invalid token",
    MISSING_TOKEN: "Unauthorized: Missing or invalid token",
    USER_NOT_FOUND: "Unauthorized: User not found",
  };
  