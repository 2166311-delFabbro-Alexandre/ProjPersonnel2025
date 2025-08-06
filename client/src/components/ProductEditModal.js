import React, { useState } from 'react';
import './ProductEditModal.css';

/**
 * Modal d'édition de produit
 * Permet aux administrateurs de modifier les détails d'un produit.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.product - Le produit à éditer
 * @param {Function} props.onSave - Fonction appelée pour sauvegarder les modifications
 * @param {Function} props.onCancel - Fonction appelée pour annuler les modifications
 * @param {boolean} props.loading - Indique si une opération est en cours
 * @returns {JSX.Element} - Modal d'édition
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function ProductEditModal({ product, onSave, onCancel, loading }) {
    // État pour gérer les détails du produit en cours d'édition
    const [editedProduct, setEditedProduct] = useState({
        ...product,
        isUnique: product.isUnique || false,
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : null,
        unlimitedStock: product.stockQuantity === null && product.inStock ? true : false
    });
    // États pour gérer les erreurs et le chargement de l'image
    const [error, setError] = useState('');
    const [productImages, setProductImages] = useState(
        product.images && product.images.length > 0
            ? product.images
            : product.imageUrl
                ? [{ url: product.imageUrl, isMain: true, order: 0 }]
                : []
    );

    // États pour gérer les fichiers multiples et leurs prévisualisations
    const [multipleFiles, setMultipleFiles] = useState([]);
    const [multiplePreviewUrls, setMultiplePreviewUrls] = useState([]);
    const [uploadingMultiple, setUploadingMultiple] = useState(false);

    // Fonction pour gérer les changements dans les champs du formulaire
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let updatedProduct = { ...editedProduct };

        if (type === 'checkbox') {
            updatedProduct[name] = checked;

            // Handle special inventory logic
            if (name === 'inStock' && !checked) {
                updatedProduct.isUnique = false;
                updatedProduct.unlimitedStock = false;
                updatedProduct.stockQuantity = null;
            } else if (name === 'isUnique' && checked) {
                updatedProduct.stockQuantity = 1;
                updatedProduct.unlimitedStock = false;
            } else if (name === 'unlimitedStock' && checked) {
                updatedProduct.stockQuantity = null;
                updatedProduct.isUnique = false;
            }
        } else {
            if (name === 'stockQuantity') {
                updatedProduct[name] = value === '' ? null : Number(value);
            } else if (name === 'price') {
                updatedProduct[name] = value === '' ? '' : Number(value);
            } else {
                updatedProduct[name] = value;
            }
        }

        setEditedProduct(updatedProduct);
    };

    // Fonction pour gérer la soumission du formulaire d'édition
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation des champs nom et prix requis
        if (!editedProduct.name || !editedProduct.price) {
            setError('Nom et prix sont obligatoires');
            return;
        }

        // Validation des images
        if (productImages.length === 0) {
            setError('Au moins une image est requise');
            return;
        }

        // Assure que l'image principale est définie
        const hasMainImage = productImages.some(img => img.isMain);
        if (!hasMainImage && productImages.length > 0) {
            setProductImages(prev => [
                { ...prev[0], isMain: true },
                ...prev.slice(1)
            ]);
        }

        // Inclus les images dans le produit édité
        const finalProduct = {
            ...editedProduct,
            images: productImages
        };

        // Enlève l'ancienne imageUrl si elle existe
        delete finalProduct.imageUrl;

        onSave(finalProduct);
    };

    /**
     * Gère le changement de fichiers multiples
     * Met à jour l'état avec les fichiers sélectionnés et crée des prévisualisations
     */
    const handleMultipleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setMultipleFiles(files);

        // Crée des prévisualisations des images sélectionnées
        const newPreviewUrls = [];

        // Utilise FileReader pour lire les fichiers et créer des URLs de prévisualisation
        files.forEach(file => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                newPreviewUrls.push(fileReader.result);
                if (newPreviewUrls.length === files.length) {
                    setMultiplePreviewUrls(newPreviewUrls);
                }
            };
            fileReader.readAsDataURL(file);
        });
    };

    /**
     * Télécharge plusieurs images vers le serveur
     * Utilise FormData pour envoyer les fichiers sélectionnés
     */
    const handleUploadMultiple = async (e) => {
        e.preventDefault();

        // Vérifie si des fichiers ont été sélectionnés
        if (multipleFiles.length === 0) {
            setError('Veuillez sélectionner des images');
            return;
        }

        setUploadingMultiple(true);

        try {
            const formData = new FormData();
            multipleFiles.forEach(file => {
                formData.append('images', file);
            });

            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/upload/multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Échec du téléchargement des images');
            }

            const data = await response.json();

            // Ajoute les nouvelles images au produit
            setProductImages(prev => [...prev, ...data.images]);

            // Réinitialise les fichiers et les prévisualisations
            setMultipleFiles([]);
            setMultiplePreviewUrls([]);
        } catch (error) {
            setError('Erreur: ' + error.message);
        } finally {
            setUploadingMultiple(false);
        }
    };

    /**
     * Définit une image comme l'image principale du produit
     */
    const setMainImage = (index) => {
        setProductImages(prev => {
            const updatedImages = prev.map(img => ({
                ...img,
                isMain: false
            }));
            if (updatedImages[index]) {
                updatedImages[index].isMain = true;
            }
            return updatedImages;
        });
    };

    /**
     * Supprime une image du produit
     * Met à jour l'état des images du produit en filtrant l'image supprimée
     */
    const removeImage = (index) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="modal-overlay">
            {/* Conteneur principal de la modal d'édition */}
            <div className="edit-modal">
                <h3>Modifier le Produit</h3>

                {/* Affiche un message d'erreur si nécessaire */}
                {error && <div className="error-message">{error}</div>}

                {/* Formulaire d'édition du produit */}
                <form onSubmit={handleSubmit} className="edit-form">

                    {/* Champ de saisie pour le nom du produit */}
                    <div className="form-group">
                        <label htmlFor="edit-name">Nom du produit*</label>
                        <input
                            type="text"
                            id="edit-name"
                            name="name"
                            value={editedProduct.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Champ de saisie pour la description du produit */}
                    <div className="form-group">
                        <label htmlFor="edit-description">Description</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={editedProduct.description || ''}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Champ de saisie pour le prix du produit */}
                    <div className="form-group">
                        <label htmlFor="edit-price">Prix*</label>
                        <input
                            type="number"
                            id="edit-price"
                            name="price"
                            min="0"
                            step="0.01"
                            value={editedProduct.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Gestion des images */}
                    <div className="form-group">
                        <label>Images du produit</label>

                        {/* Affiche les images actuelles du produit */}
                        {productImages.length > 0 && (
                            <div className="product-images-gallery">
                                <h4>Images actuelles</h4>
                                <div className="images-grid">
                                    {productImages.map((img, index) => (
                                        <div key={index} className={`product-image-item ${img.isMain ? 'main-image' : ''}`}>
                                            <img src={img.url} alt={`Produit ${index}`} />
                                            <div className="image-actions">
                                                <button
                                                    type="button"
                                                    className={`set-main-btn ${img.isMain ? 'active' : ''}`}
                                                    onClick={() => setMainImage(index)}
                                                >
                                                    {img.isMain ? 'Image principale' : 'Définir comme principale'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Téléchargement d'images multiples */}
                        <div className="form-group">
                            <label htmlFor="edit-multiple-images">Ajouter plusieurs images</label>
                            <div className="multiple-upload">
                                <input
                                    type="file"
                                    id="edit-multiple-images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleMultipleFilesChange}
                                    disabled={uploadingMultiple || loading}
                                />
                                <button
                                    type="button"
                                    onClick={handleUploadMultiple}
                                    disabled={multipleFiles.length === 0 || uploadingMultiple || loading}
                                >
                                    {uploadingMultiple ? 'Téléchargement...' : 'Télécharger'}
                                </button>
                            </div>

                            {multiplePreviewUrls.length > 0 && (
                                <div className="multiple-image-preview">
                                    {multiplePreviewUrls.map((url, index) => (
                                        <div key={index} className="preview-image-container">
                                            <img src={url} alt={`Aperçu ${index}`} className="preview-image" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gestion de l'inventaire */}
                    <div className="inventory-management">
                        <h4>Gestion de l'inventaire</h4>

                        {/* Case à cocher pour indiquer si le produit est en stock */}
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="inStock"
                                    checked={editedProduct.inStock}
                                    onChange={handleInputChange}
                                />
                                En stock
                            </label>
                        </div>

                        {/* Option pour article unique */}
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isUnique"
                                    checked={editedProduct.isUnique}
                                    onChange={handleInputChange}
                                />
                                Article unique (quantité limitée à 1)
                            </label>
                        </div>

                        {/* Gestion de la quantité */}
                        <div className="form-group">
                            <label htmlFor="stockQuantity">Quantité en stock</label>
                            <div className="quantity-control">
                                <input
                                    type="number"
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    min="0"
                                    value={editedProduct.stockQuantity !== null ? editedProduct.stockQuantity : ''}
                                    onChange={handleInputChange}
                                    disabled={!editedProduct.inStock || editedProduct.isUnique || editedProduct.unlimitedStock}
                                    placeholder={editedProduct.isUnique ? '1' : 'Quantité'}
                                />
                                <div className="form-group checkbox unlimited-stock">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="unlimitedStock"
                                            checked={editedProduct.unlimitedStock}
                                            onChange={handleInputChange}
                                            disabled={!editedProduct.inStock || editedProduct.isUnique}
                                        />
                                        Quantité illimitée
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions de la modal d'édition */}
                    <div className="modal-actions">
                        {/* Bouton pour sauvegarder les modifications */}
                        <button type="submit"
                            disabled={loading || uploadingMultiple}
                            className="save-button"
                        >
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        {/* Bouton pour annuler les modifications */}
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cancel-button"
                            disabled={loading || uploadingMultiple}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}