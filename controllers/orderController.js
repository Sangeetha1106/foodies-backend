const db = require('../config/db');

// Place order
const placeOrder = async (req, res) => {
    const client = await db.pool.connect();
    try {
        console.log("ORDER BODY:", req.body);
        const { user_id, total_price, address, name, phone, items } = req.body;

        const userId = user_id || 1; // Fallback to 1 for testing
        const finalName = name || "Guest";
        const finalPhone = phone || "0000000000";

        await client.query('BEGIN');

        // 1. Create Order
        const orderResult = await client.query(
            "INSERT INTO orders (user_id, total_price, address, name, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id",
            [userId, total_price, address, finalName, finalPhone]
        );
        const orderId = orderResult.rows[0].id;

        // 2. Insert Order Items
        console.log(`[placeOrder] Processing ${items ? items.length : 0} items for order ${orderId}`);
        
        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                console.log(`[placeOrder] Inserting item: food_id=${item.food_id || item.id}, qty=${item.quantity}`);
                await client.query(
                    "INSERT INTO order_items (order_id, food_id, quantity, price) VALUES ($1, $2, $3, $4)",
                    [orderId, item.food_id || item.id, item.quantity, item.price]
                );
            }
        } else {
            console.warn("[placeOrder] No items found in order request!");
        }

        // 3. Clear Cart for this user
        console.log(`[placeOrder] Clearing cart for user_id: ${userId}`);
        await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);

        await client.query('COMMIT');

        res.json({ 
            message: "Order placed successfully", 
            order_id: orderId 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Order Error:", err);
        res.status(500).json({ error: "Order failed", details: err.message });
    } finally {
        client.release();
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await db.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({ message: 'Order status updated', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all orders (Admin view) or User orders
const getOrders = async (req, res) => {
    try {
        const userId = req.query.user_id;
        console.log(`[getOrders] Fetching orders. Filter user_id: ${userId || 'NONE (All)'}`);
        
        let query = `
            SELECT o.id, o.total_price, o.address, o.created_at, o.status, o.name AS customer_name,
                   u.email,
                   f.name AS food_name,
                   oi.quantity, oi.price AS item_price, f.image
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN foods f ON oi.food_id = f.id
        `;
        
        const params = [];
        if (userId) {
            query += ` WHERE o.user_id = $1 `;
            params.push(userId);
        }
        
        query += ` ORDER BY o.created_at DESC;`;
        
        const { rows } = await db.query(query, params);

        const ordersMap = new Map();
        
        rows.forEach(row => {
            if (!ordersMap.has(row.id)) {
                ordersMap.set(row.id, {
                    id: row.id,
                    user_email: row.email,
                    name: row.customer_name,
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
        console.error("[getOrders] error:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get user orders (own orders) - Simplified version if needed, but getOrders handles it now
const getUserOrders = async (req, res) => {
    // We can just call getOrders or keep it separate. 
    // The user specifically asked for a GET /api/orders that returns ALL orders for admin.
    return getOrders(req, res);
};

module.exports = { placeOrder, getUserOrders, updateOrderStatus, getOrders };
