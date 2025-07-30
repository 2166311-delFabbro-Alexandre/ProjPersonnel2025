const PortfolioItem = require('../models/PortfolioItem');
const cloudinary = require('../utils/cloudinary');

/**
 * Get all portfolio items
 */
exports.getAllItems = async (req, res) => {
    try {
        const portfolioItems = await PortfolioItem.find().sort({ displayOrder: 1, createdAt: -1 });

        res.json(portfolioItems);
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des éléments du portfolio'
        });
    }
};

/**
 * Create new portfolio item
 */
exports.createItem = async (req, res) => {
    try {
        const { title, imageUrl, featured } = req.body;

        // Check for required fields
        if (!title || !imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et l\'image sont requis'
            });
        }

        // Find highest display order to place new item at the end
        const highestOrder = await PortfolioItem.findOne().sort('-displayOrder');
        const nextOrder = highestOrder ? highestOrder.displayOrder + 1 : 1;

        const portfolioItem = new PortfolioItem({
            title,
            imageUrl,
            featured: featured || false,
            displayOrder: nextOrder
        });

        const savedItem = await portfolioItem.save();

        res.status(201).json({
            success: true,
            message: 'Élément ajouté au portfolio avec succès',
            item: savedItem
        });
    } catch (error) {
        console.error('Error creating portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'élément du portfolio',
            error: error.message
        });
    }
};

/**
 * Update portfolio item
 */
exports.updateItem = async (req, res) => {
    try {
        const { title, imageUrl, featured, displayOrder } = req.body;

        const updatedItem = await PortfolioItem.findByIdAndUpdate(
            req.params.id,
            {
                title,
                ...(imageUrl && { imageUrl }),
                ...(featured !== undefined && { featured }),
                ...(displayOrder !== undefined && { displayOrder })
            },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Élément du portfolio non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Élément du portfolio mis à jour avec succès',
            item: updatedItem
        });
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'élément du portfolio',
            error: error.message
        });
    }
};

/**
 * Delete portfolio item
 */
exports.deleteItem = async (req, res) => {
    try {
        const deletedItem = await PortfolioItem.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'Élément du portfolio non trouvé'
            });
        }

        // If using Cloudinary, extract and delete the image
        if (deletedItem.imageUrl && deletedItem.imageUrl.includes('cloudinary')) {
            try {
                // Extract the public ID including the folder path
                const urlParts = deletedItem.imageUrl.split('/');
                const publicIdWithExt = urlParts[urlParts.length - 1];
                const publicId = publicIdWithExt.split('.')[0];

                // Construct the full path including folder
                const fullPublicId = `projet-personnel/portfolio/${publicId}`;

                await cloudinary.cloudinary.uploader.destroy(fullPublicId);
                console.log('Deleted image from Cloudinary:', fullPublicId);
            } catch (cloudinaryError) {
                console.error('Error deleting image from Cloudinary:', cloudinaryError);
            }
        }

        res.json({
            success: true,
            message: 'Élément du portfolio supprimé avec succès'
        });
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'élément du portfolio',
            error: error.message
        });
    }
};

/**
 * Reorder portfolio items
 */
exports.reorderItems = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Format de données invalide'
            });
        }

        // Update each item with its new display order
        const updatePromises = items.map((item, index) => {
            return PortfolioItem.findByIdAndUpdate(
                item.id,
                { displayOrder: index },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        const updatedItems = await PortfolioItem.find().sort({ displayOrder: 1 });

        res.json({
            success: true,
            message: 'Ordre des éléments du portfolio mis à jour avec succès',
            items: updatedItems
        });
    } catch (error) {
        console.error('Error reordering portfolio items:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la réorganisation des éléments du portfolio',
            error: error.message
        });
    }
};