const db = require('../config/db');

// Add to cart
const addToCart = async (req, res) => {
    try {
        console.log("BODY:", req.body); // EXACT LOG REQUESTED
        const { user_id, food_id, quantity } = req.body;
        const userId = req.user ? req.user.id : user_id;

        if (!userId || !food_id) {
            return res.status(400).json({ error: "Missing user_id or food_id" });
        }

        await db.query(
            "INSERT INTO cart (user_id, food_id, quantity) VALUES ($1,$2,$3) ON CONFLICT (user_id, food_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity",
            [userId, food_id, quantity || 1]
        );

        res.json({ message: "Added to cart successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// Get cart items for logged in user
const getCart = async (req, res) => {
    // Try to get user_id from token (set by protect middleware) or body/query for dev
    const user_id = (req.user ? req.user.id : null) || req.query.user_id || 1; 
    
    console.log(`[CartController] getCart - Fetching cart for user_id: ${user_id}`);
    
    try {
        const query = `
            SELECT cart.id, cart.food_id, cart.quantity, foods.name, foods.price, foods.image 
            FROM cart
            JOIN foods ON cart.food_id = foods.id 
            WHERE cart.user_id = $1
        `;
        const cartItems = await db.query(query, [user_id]);
        
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const itemsWithImages = cartItems.rows.map(item => ({
            ...item,
            image: `${baseUrl}/images/${item.image}`
        }));

        console.log(`[CartController] getCart - Found ${itemsWithImages.length} items`);
        res.json(itemsWithImages);
    } catch (error) {
        console.error('[CartController] getCart error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update quantity
const updateCartQuantity = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = (req.user ? req.user.id : null) || req.body.user_id;

    if (!user_id) {
        return res.status(401).json({ message: "User ID required" });
    }

    try {
        const updated = await db.query(
            'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [quantity, id, user_id]
        );
        if (updated.rowCount === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        res.json(updated.rows[0]);
    } catch (error) {
        console.error("[CartController] updateCartQuantity error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Remove from cart
const removeFromCart = async (req, res) => {
    const { id } = req.params;
    const user_id = (req.user ? req.user.id : null) || req.body.user_id || req.query.user_id;

    if (!user_id) {
        return res.status(401).json({ message: "User ID required" });
    }

    try {
        const result = await db.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [id, user_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error("[CartController] removeFromCart error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
