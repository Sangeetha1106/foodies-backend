const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function checkSchema() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log("Checking tables...");
        
        console.log("\nTesting cart query...");
        try {
            const test = await client.query("SELECT food_id FROM cart LIMIT 1");
            console.log("Cart query successful!");
        } catch (e) {
            console.error("Cart query failed:", e.message);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkSchema();
