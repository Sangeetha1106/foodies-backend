const db = require('../config/db');

const getFoods = async (req, res) => {
    try {
        const foods = await db.query('SELECT * FROM foods');

        // Dynamic base URL based on request origin
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Map images to full URLs — smart detection:
        // • If already a full URL (http/https), return as-is (admin entered a CDN/external URL)
        // • If a bare filename like 'burger.jpg', construct the backend static URL
        // • If null/empty, return null (frontend will use fallback image)
        const foodsWithImages = foods.rows.map(food => {
            const rawImage = food.image;

            let resolvedImage = null;
            if (rawImage) {
                if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
                    // Already a full URL — use as-is (admin entered full CDN/external URL)
                    resolvedImage = rawImage;
                } else {
                    // Bare filename (seeded data) — prefix with backend base URL
                    resolvedImage = `${baseUrl}/images/${rawImage}`;
                }
            }

            return {
                ...food,
                image: resolvedImage
            };
        });

        res.json(foodsWithImages);
    } catch (error) {
        console.error('[FoodController] Error fetching foods:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getFoods };
