import React, { useState } from 'react';
import './ProductEditModal.css';

/**
 * Modal d'édition de produit
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.product - Le produit à éditer
 * @param {Function} props.onSave - Fonction appelée pour sauvegarder les modifications
 * @param {Function} props.onCancel - Fonction appelée pour annuler les modifications
 * @param {boolean} props.loading - Indique si une opération est en cours
 * @returns {JSX.Element} - Modal d'édition
 */
export default function ProductEditModal({ product, onSave, onCancel, loading }) {
    const [editedProduct, setEditedProduct] = useState({ ...product });
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedProduct({
            ...editedProduct,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!editedProduct.name || !editedProduct.price) {
            setError('Nom et prix sont obligatoires');
            return;
        }

        onSave(editedProduct);
    };

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

            // Update the imageUrl in the editing product
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
            <div className="edit-modal">
                <h3>Modifier le Produit</h3>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="edit-form">
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

                    <div className="form-group">
                        <label htmlFor="edit-description">Description</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={editedProduct.description || ''}
                            onChange={handleInputChange}
                        />
                    </div>

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

                    <div className="modal-actions">
                        <button type="submit" disabled={loading || uploadingImage} className="save-button">
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
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