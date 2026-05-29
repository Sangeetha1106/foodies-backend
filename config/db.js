const { Pool } = require("pg");

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {
  if (err) {
    console.error("REAL DATABASE ERROR:", err.message);
    process.exit(1);
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = pool;
