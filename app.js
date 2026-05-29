const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Main Route
app.get('/', (req, res) => {
    res.send('Food Ordering API is running...');
});

// TEST ROUTE (Requested)
app.get('/api/test', (req, res) => {
  res.send("API working");
});

// Request Logger (Move before static to see image requests)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));



const db = require('./config/db');

// Update Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Port
const PORT = process.env.PORT || 5000;

module.exports = { app, PORT };
