const Product = require('../models/Product');

/**
 * Obtenir tous les produits
 */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Obtenir un produit par son ID
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Créer un nouveau produit
 */
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, images, inStock, isUnique, stockQuantity } = req.body;

        // Validate that we have at least one image
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Au moins une image est requise pour le produit'
            });
        }

        // Process images
        const processedImages = images.map((img, index) => ({
            url: img.url,
            isMain: img.isMain || (index === 0 && !images.some(i => i.isMain)),
            order: img.order || index
        }));

        // Get the main image URL for backward compatibility
        const mainImage = processedImages.find(img => img.isMain) || processedImages[0];

        const newProduct = new Product({
            name,
            description,
            price,
            imageUrl: mainImage.url,
            images: processedImages,
            inStock: inStock !== undefined ? inStock : true,
            isUnique: isUnique || false,
            stockQuantity: isUnique ? 1 : stockQuantity
        });

        const saved = await newProduct.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(400).json({
            error: 'Erreur lors de la création du produit',
            details: err.message
        });
    }
};

/**
 * Mettre à jour un produit existant
 */
exports.updateProduct = async (req, res) => {
    try {
        const { imageUrl, images, ...otherData } = req.body;

        // Process images
        let updateData = { ...otherData };

        // If we have images array
        if (images && Array.isArray(images)) {
            updateData.images = images.map((img, index) => ({
                url: img.url,
                isMain: img.isMain || (index === 0 && !imageUrl),
                order: img.order || index
            }));
        }

        // If there's a single imageUrl, add it as a main image if no images exist
        if (imageUrl) {
            updateData.imageUrl = imageUrl;

            // If we don't have any images yet, create one from imageUrl
            if (!updateData.images || updateData.images.length === 0) {
                updateData.images = [{
                    url: imageUrl,
                    isMain: true,
                    order: 0
                }];
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(400).json({
            error: 'Erreur lors de la mise à jour du produit',
            details: err.message
        });
    }
};

/**
 * Supprimer un produit
 */
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        res.json({ message: 'Produit supprimé avec succès' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
    }
};

/**
 * Vérifier la disponibilité des produits dans le panier
 */
exports.checkAvailability = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({
                success: false,
                message: 'Identifiants de produits invalides'
            });
        }

        // Récupère les produits correspondants aux IDs fournis
        const products = await Product.find({
            _id: { $in: productIds }
        }).select('_id name price imageUrl inStock isUnique stockQuantity');

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error checking product availability:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des produits',
            error: error.message
        });
    }
};