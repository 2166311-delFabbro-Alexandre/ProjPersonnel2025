const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.get('/', portfolioController.getAllItems);

// Routes administrateur - toutes protégées
router.post('/', authenticateToken, portfolioController.createItem);
router.put('/:id', authenticateToken, portfolioController.updateItem);
router.delete('/:id', authenticateToken, portfolioController.deleteItem);
router.post('/reorder', authenticateToken, portfolioController.reorderItems);

module.exports = router;