const PageContent = require('../models/PageContent');

/**
 * Get page content by pageId
 */
exports.getPageContent = async (req, res) => {
    try {
        const { pageId } = req.params;

        let pageContent = await PageContent.findOne({ pageId });

        // If no content exists yet, return default content
        if (!pageContent) {
            return res.status(404).json({
                success: false,
                message: 'Contenu de page non trouvé'
            });
        }

        res.json(pageContent);
    } catch (error) {
        console.error('Error fetching page content:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du contenu de la page'
        });
    }
};

/**
 * Update or create page content
 */
exports.updatePageContent = async (req, res) => {
    try {
        const { pageId } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et le contenu sont requis'
            });
        }

        // Find and update if exists, create if doesn't exist
        const updatedContent = await PageContent.findOneAndUpdate(
            { pageId },
            {
                title,
                content,
                lastUpdated: Date.now()
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Contenu de page mis à jour avec succès',
            pageContent: updatedContent
        });
    } catch (error) {
        console.error('Error updating page content:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du contenu de la page'
        });
    }
};