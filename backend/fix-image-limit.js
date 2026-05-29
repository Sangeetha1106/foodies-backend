require('dotenv').config();
const db = require('./config/db');

async function fixImageLimit() {
    try {
        console.log("Updating foods table...");
        await db.query('ALTER TABLE foods ALTER COLUMN image TYPE TEXT;');
        console.log("Success! Image column limit removed.");
    } catch (err) {
        console.error("Error updating table:", err.message);
    } finally {
        process.exit();
    }
}

fixImageLimit();
