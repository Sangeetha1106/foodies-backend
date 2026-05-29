require('dotenv').config();
const db = require('./config/db');

async function checkSchema() {
    try {
        const { rows } = await db.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'foods'"
        );
        console.log("Foods Table Columns:", rows);
    } catch (err) {
        console.error("Error checking schema:", err.message);
    } finally {
        process.exit();
    }
}

checkSchema();
