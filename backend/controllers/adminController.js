const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Admin login
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Not an admin.' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new food item
const addFood = async (req, res) => {
    const { name, price, image, description, category } = req.body;

    try {
        const { rows } = await db.query(
            'INSERT INTO foods (name, price, image, description, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, price, image, description || 'Delicious food item', category || 'General']
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete food item
const deleteFood = async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await db.query('DELETE FROM foods WHERE id = $1', [id]);
        if (rowCount > 0) {
            res.json({ message: 'Food item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin view)
const getOrders = async (req, res) => {
    try {
        console.log("[AdminDashboard] Fetching all orders...");
        // Use the specific JOIN query requested by the user
        const query = `
            SELECT orders.id, users.email as user_email, orders.total_price, orders.address, orders.created_at, orders.status,
                   orders.name as customer_name, orders.phone, foods.name AS food_name, order_items.quantity
            FROM orders
            JOIN users ON orders.user_id = users.id
            JOIN order_items ON orders.id = order_items.order_id
            JOIN foods ON order_items.food_id = foods.id
            ORDER BY orders.created_at DESC
        `;
        
        const { rows } = await db.query(query);

        // Group rows by order ID
        const ordersMap = new Map();
        
        rows.forEach(row => {
            if (!ordersMap.has(row.id)) {
                ordersMap.set(row.id, {
                    id: row.id,
                    user_email: row.user_email,
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
                quantity: row.quantity
            });
        });

        const result = Array.from(ordersMap.values());
        console.log(`[AdminDashboard] Found ${result.length} unique orders`);
        res.json(result);
    } catch (error) {
        console.error("[AdminDashboard] error:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    adminLogin,
    addFood,
    deleteFood,
    getOrders
};
