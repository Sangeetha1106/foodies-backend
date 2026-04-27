const db = require('../config/db');

const getFoods = async (req, res) => {
    try {
        const foods = await db.query('SELECT * FROM foods');
        
        // Dynamic base URL based on request
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Map images to full URLs
        const foodsWithImages = foods.rows.map(food => ({
            ...food,
            image: `http://localhost:5000/images/${food.image}`
        }));

        res.json(foodsWithImages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getFoods };
