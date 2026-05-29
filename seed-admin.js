const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const adminEmail = 'admin@food.com';
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const name = 'Admin User';
        const role = 'admin';

        // Check if admin already exists
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

        if (rows.length > 0) {
            console.log("Admin user already exists. Updating password...");
            await db.query(
                'UPDATE users SET password = $1, role = $2 WHERE email = $3',
                [hashedPassword, role, adminEmail]
            );
        } else {
            console.log("Creating admin user...");
            await db.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, adminEmail, hashedPassword, role]
            );
        }

        console.log("Admin seeded successfully:");
        console.log("Email: " + adminEmail);
        console.log("Password: " + adminPassword);
        process.exit(0);
    } catch (err) {
        console.error("Failed to seed admin:", err.message);
        process.exit(1);
    }
}

seedAdmin();
