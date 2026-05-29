const express = require('express');
const { getUserOrders, updateOrderStatus, getOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

const router = express.Router();

// router.use(protect); // All order routes are protected

router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    console.log("ORDER BODY:", req.body);

    const { user_id, total_price, address, name, phone, items } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (!user_id || !total_price) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    await client.query('BEGIN');

    // 1. Insert into orders table
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_price, address, name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, total_price, address, name, phone]
    );

    const createdOrder = orderResult.rows[0];
    const orderId = createdOrder.id;

    // 2. Insert into order_items table
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, food_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.food_id || item.id, item.quantity, item.price]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      order: createdOrder
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("ORDER ERROR:", err);
    res.status(500).json({
      error: "Order failed"
    });
  } finally {
    client.release();
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`[getUserOrders] Fetching orders for user_id: ${userId}`);

    const query = `
      SELECT o.id, o.total_price, o.address, o.created_at, o.status, o.name AS customer_name, o.phone,
             oi.quantity, oi.price AS item_price,
             f.name AS food_name, f.image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN foods f ON oi.food_id = f.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC;
    `;

    const { rows } = await pool.query(query, [userId]);

    const ordersMap = new Map();

    rows.forEach(row => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          name: row.customer_name,
          phone: row.phone,
          total_price: row.total_price,
          address: row.address,
          created_at: row.created_at,
          status: row.status,
          items: []
        });
      }
      ordersMap.get(row.id).items.push({
        food_name: row.food_name,
        quantity: row.quantity,
        price: row.item_price,
        image: row.image
      });
    });

    const result = Array.from(ordersMap.values());
    res.json(result);
  } catch (error) {
    console.error("[getUserOrders] error:", error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.get('/my', getUserOrders); // User's own orders
router.get('/', getOrders); // For admin (all) or user (own) - handled in controller
router.put('/:id/status', updateOrderStatus);

module.exports = router;
