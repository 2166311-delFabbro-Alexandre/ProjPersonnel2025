const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/', orderController.createOrder);

// Admin routes
router.get('/', authenticateToken, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, orderController.updateOrderStatus);

module.exports = router;