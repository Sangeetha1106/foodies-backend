const express = require('express');
const { placeOrder, getUserOrders, updateOrderStatus, getOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// router.use(protect); // All order routes are protected

router.post('/', placeOrder);
router.get('/my', getUserOrders); // User's own orders
router.get('/', getOrders); // For admin (all) or user (own) - handled in controller
router.put('/:id/status', updateOrderStatus);

module.exports = router;
