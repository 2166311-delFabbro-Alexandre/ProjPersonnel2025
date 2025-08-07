const express = require('express');
const router = express.Router();
const pageContentController = require('../controllers/pageContentController');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.get('/:pageId', pageContentController.getPageContent);

// Routes administrateur
router.put('/:pageId', authenticateToken, pageContentController.updatePageContent);

module.exports = router;