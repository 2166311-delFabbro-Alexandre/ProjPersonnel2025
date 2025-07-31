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
    const [uploadingImage, setUploadingImage] = useState(false);

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
        // Empêche le rechargement de la page lors de la soumission du formulaire
        e.preventDefault();

        // Vérifie que les champs obligatoires sont remplis
        if (!editedProduct.name || !editedProduct.price) {
            setError('Nom et prix sont obligatoires');
            return;
        }

        // Lance la fonction de sauvegarde avec le produit édité
        onSave(editedProduct);
    };

    /**
     * Gère le téléchargement de l'image du produit.
     * 
     * @param {*} e - L'événement de changement du champ de fichier
     * @returns 
     */
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Échec du téléchargement');
            }

            const data = await response.json();

            setEditedProduct({
                ...editedProduct,
                imageUrl: data.imageUrl
            });
        } catch (err) {
            setError('Erreur lors du téléchargement de l\'image: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
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

                    {/* Champ de saisie pour l'URL de l'image du produit */}
                    <div className="form-group">
                        <label htmlFor="edit-imageUrl">URL de l'image</label>
                        <input
                            type="text"
                            id="edit-imageUrl"
                            name="imageUrl"
                            value={editedProduct.imageUrl || ''}
                            onChange={handleInputChange}
                        />
                        {editedProduct.imageUrl && (
                            <div className="image-preview">
                                <img src={editedProduct.imageUrl} alt="Aperçu" />
                            </div>
                        )}
                    </div>

                    {/* Champ de téléchargement pour une nouvelle image */}
                    <div className="form-group">
                        <label htmlFor="edit-new-image">Télécharger une nouvelle image</label>
                        <input
                            type="file"
                            id="edit-new-image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage || loading}
                        />
                        {uploadingImage && <p>Téléchargement en cours...</p>}
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
                        <button type="submit" disabled={loading || uploadingImage} className="save-button">
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        {/* Bouton pour annuler les modifications */}
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cancel-button"
                            disabled={loading || uploadingImage}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}