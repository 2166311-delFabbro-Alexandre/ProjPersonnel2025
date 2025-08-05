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
        const newProduct = new Product(req.body);
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
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
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