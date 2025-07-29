const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', portfolioController.getAllItems);

// Admin routes - all protected
router.post('/', authenticateToken, portfolioController.createItem);
router.put('/:id', authenticateToken, portfolioController.updateItem);
router.delete('/:id', authenticateToken, portfolioController.deleteItem);
router.post('/reorder', authenticateToken, portfolioController.reorderItems);

module.exports = router;