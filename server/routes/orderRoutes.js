const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/', orderController.createOrder);

// Admin routes
router.get('/', authenticateToken, orderController.getAllOrders);

router.get('/test', (req, res) => {
    res.json({ message: 'Order API is working' });
});

module.exports = router;