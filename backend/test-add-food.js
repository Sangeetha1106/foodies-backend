require('dotenv').config();
const db = require('./config/db');

async function testAddFood() {
    try {
        console.log("Adding food item...");
        const { rows } = await db.query(
            'INSERT INTO foods (name, price, image, description, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            ['Test Food', 15.99, 'test.jpg', 'Delicious test', 'General']
        );
        console.log("Success:", rows[0]);
    } catch (err) {
        console.error("Error adding food:", err.message);
    } finally {
        process.exit();
    }
}

testAddFood();
