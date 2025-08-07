const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.post('/', orderController.createOrder);

// Routes administrateur
router.get('/', authenticateToken, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, orderController.updateOrderStatus);

module.exports = router;