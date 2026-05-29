const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

const seedAdmin = async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    try {
        await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
            ['Admin User', 'admin@food.com', hashedPassword, 'admin']
        );
        console.log('Admin user seeded');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

seedAdmin();
