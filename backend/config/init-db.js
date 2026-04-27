const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

async function setupDatabase() {
    // 1. Connect to 'postgres' to create the 'food' database
    const postgresClient = new Client({ ...dbConfig, database: 'postgres' });

    try {
        await postgresClient.connect();
        console.log("Connected to 'postgres' default database.");

        const dbName = process.env.DB_NAME || 'food';
        
        // Check if database exists
        const checkDb = await postgresClient.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        
        if (checkDb.rows.length === 0) {
            await postgresClient.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
        
        await postgresClient.end();

        // 2. Connect to the new 'food' database to apply schema
        const foodClient = new Client({ ...dbConfig, database: dbName });
        await foodClient.connect();
        console.log(`Connected to '${dbName}' database.`);

        const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolons to execute multiple statements (basic approach)
        // Note: For complex schemas with triggers/functions, a more robust parser would be needed
        // but for this simple schema, it works.
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

        for (const statement of statements) {
            await foodClient.query(statement);
        }

        console.log("Database schema and seed data applied successfully.");
        await foodClient.end();
        console.log("Setup complete. You can now start the server with 'npm run dev'.");

    } catch (error) {
        console.error("Initialization failed:", error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    setupDatabase();
}
