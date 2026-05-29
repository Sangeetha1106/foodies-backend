const db = require('./config/db');

async function migrate() {
    try {
        console.log("Starting migration...");
        await db.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
        `);
        console.log("Migration successful: status column added to orders table.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
