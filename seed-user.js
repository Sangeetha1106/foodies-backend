const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedUser = async () => {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Delete existing if any to ensure fresh password
        await client.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
        
        await client.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            ['Test User', 'test@example.com', hashedPassword]
        );
        
        console.log('Test user created successfully!');
    } catch (error) {
        console.error('Failed to seed user:', error.message);
    } finally {
        await client.end();
    }
};

seedUser();
