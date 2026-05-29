const express = require('express');
const router = express.Router();
const { 
    adminLogin, 
    addFood, 
    deleteFood, 
    getOrders 
} = require('../controllers/adminController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Public admin login
router.post('/login', adminLogin);

// Protected admin routes
router.get('/orders', protect, adminProtect, getOrders);
router.post('/foods', protect, adminProtect, addFood);
router.delete('/foods/:id', protect, adminProtect, deleteFood);

module.exports = router;
