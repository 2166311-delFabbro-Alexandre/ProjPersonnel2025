const express = require('express');
const router = express.Router();
const pageContentController = require('../controllers/pageContentController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/:pageId', pageContentController.getPageContent);

// Admin routes
router.put('/:pageId', authenticateToken, pageContentController.updatePageContent);

module.exports = router;