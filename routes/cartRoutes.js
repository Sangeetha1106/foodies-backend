const express = require('express');
const { addToCart, getCart, updateCartQuantity, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// NOTE: Middleware 'protect' can be commented out for local manual testing without JWT
// router.use(protect);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:id', updateCartQuantity);
router.delete('/:id', removeFromCart);

module.exports = router;
