import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import ProductEditModal from './ProductEditModal';
import './AdminProducts.css';

/**
 * Composant pour la gestion des produits dans le tableau de bord administrateur
 * @returns {JSX.Element} - Le composant de gestion des produits
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function AdminProducts() {
    // État pour gérer le chargement
    const [loading, setLoading] = useState(false);
    // État pour gérer les erreurs
    const [error, setError] = useState('');
    // État pour stocker la liste des produits
    const [products, setProducts] = useState([]);
    // État pour gérer le fichier sélectionné pour le téléchargement d'images
    const [selectedFile, setSelectedFile] = useState(null);
    // État pour gérer le statut du téléchargement d'images
    const [uploadStatus, setUploadStatus] = useState('');
    // État pour gérer l'URL de prévisualisation de l'image
    const [previewUrl, setPreviewUrl] = useState('');
    // État pour gérer l'édition de produit
    const [isEditing, setIsEditing] = useState(false);
    // État pour gérer le produit en cours d'édition
    const [editingProduct, setEditingProduct] = useState(null);
    // État pour gérer le formulaire de création de produit
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        inStock: true,
        isUnique: false,
        stockQuantity: null,
        unlimitedStock: false
    });
    // État pour gérer le téléchargement de plusieurs fichiers
    const [multipleFiles, setMultipleFiles] = useState([]);
    // État pour gérer l'aperçu des fichiers multiples
    const [multiplePreviewUrls, setMultiplePreviewUrls] = useState([]);
    // État pour gérer le statut de téléchargement multiple
    const [uploadingMultiple, setUploadingMultiple] = useState(false);
    // État pour stocker les images de produit
    const [productImages, setProductImages] = useState([]);

    // Hook pour récupérer la liste des produits au chargement du composant
    useEffect(() => {
        fetchProducts();
    }, []);

    /**
     * Récupère la liste des produits.
     */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des produits');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMultipleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setMultipleFiles(files);

        // Create previews for all selected files
        const newPreviewUrls = [];

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

    // Add a function to upload multiple images
    const handleUploadMultiple = async (e) => {
        e.preventDefault();

        if (multipleFiles.length === 0) {
            setUploadStatus('Veuillez sélectionner des images');
            return;
        }

        setUploadStatus('Téléchargement des images en cours...');
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
            setUploadStatus(`${data.images.length} images téléchargées avec succès!`);

            // Add new images to the productImages state
            setProductImages(prev => [...prev, ...data.images]);

            // Reset multiple file selection
            setMultipleFiles([]);
            setMultiplePreviewUrls([]);
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            setUploadStatus(`Erreur: ${error.message}`);
        } finally {
            setUploadingMultiple(false);
        }
    };

    const setMainImage = (index) => {
        setProductImages(prev =>
            prev.map((img, i) => ({
                ...img,
                isMain: i === index
            }))
        );
    };

    const removeImage = (index) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Gère les changements dans le formulaire de création de produit.
     * @param {*} e - L'événement de changement.
     */
    const handleProductInputChange = (e) => {
        // Met à jour l'état du formulaire de produit en fonction des changements
        const { name, value, type, checked } = e.target;
        // Met à jour le formulaire de produit avec les nouvelles valeurs
        let updatedForm = { ...productForm };

        // Handle checkbox inputs
        if (type === 'checkbox') {
            updatedForm[name] = checked;

            // Handle special inventory logic
            if (name === 'inStock' && !checked) {
                // If not in stock, disable all inventory options
                updatedForm.isUnique = false;
                updatedForm.unlimitedStock = false;
                updatedForm.stockQuantity = null;
            } else if (name === 'isUnique' && checked) {
                // If unique item, set quantity to 1 and disable unlimited
                updatedForm.stockQuantity = 1;
                updatedForm.unlimitedStock = false;
            } else if (name === 'unlimitedStock' && checked) {
                // If unlimited, clear quantity value
                updatedForm.stockQuantity = null;
                updatedForm.isUnique = false;
            }
        } else {
            // Handle regular inputs
            if (name === 'stockQuantity') {
                // Convert to number or null
                updatedForm[name] = value === '' ? null : Number(value);

                // If quantity is 1, suggest that it might be a unique item
                if (Number(value) === 1 && !updatedForm.isUnique) {
                    // Optional: add a UI hint that they might want to check "unique item"
                }
            } else {
                updatedForm[name] = value;
            }
        }

        setProductForm(updatedForm);
    };

    /**
     * Gère la création d'un produit.
     * @param {*} e - L'événement de soumission du formulaire.
     */
    const handleCreateProduct = async (e) => {
        e.preventDefault();

        // Vérifie si le nom et le prix du produit sont fournis
        // Si l'un d'eux est manquant, affiche une erreur
        if (!productForm.name || !productForm.price) {
            setError('Nom et prix sont obligatoires');
            return;
        }

        // Vérifie si au moins une image est fournie
        if (productImages.length === 0) {
            setError('Au moins une image est requise pour le produit');
            return;
        }

        // Assure qu'il y a une image principale
        const hasMainImage = productImages.some(img => img.isMain);
        if (!hasMainImage) {
            // Si aucune image n'est marquée comme principale, marque la première comme principale
            setProductImages(prev => [
                { ...prev[0], isMain: true },
                ...prev.slice(1)
            ]);
        }

        // Prépare les données du produit à envoyer
        const productData = {
            ...productForm,
            images: productImages
        };

        delete productData.imageUrl;

        // Gère la logique de stockage
        if (!productData.inStock) {
            productData.stockQuantity = null;
            delete productData.unlimitedStock;
        } else if (productData.isUnique) {
            productData.stockQuantity = 1;
            delete productData.unlimitedStock;
        } else if (productData.unlimitedStock) {
            productData.stockQuantity = null;
            delete productData.unlimitedStock;
        }

        // Met à jour le statut de chargement
        setLoading(true);
        try {
            // Récupère le token JWT de l'authentification admin
            const token = localStorage.getItem('adminToken');
            // Envoie une requête POST pour créer un nouveau produit
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            // Vérifie si la réponse est correcte
            // Si la réponse n'est pas correcte, lance une erreur
            if (!response.ok) {
                throw new Error('Erreur lors de la création du produit');
            }

            // Récupère les données du nouveau produit créé
            const newProduct = await response.json();
            setProducts([...products, newProduct]);

            // Réinitialiser le formulaire de produit
            setProductForm({
                name: '',
                description: '',
                price: '',
                imageUrl: '',
                inStock: true,
                isUnique: false,
                stockQuantity: null,
                unlimitedStock: false
            });
            // Réinitialiser le fichier sélectionné, l'aperçu de l'image, le statut de téléchargement, les images du produit et les fichiers multiples
            setSelectedFile(null);
            setPreviewUrl('');
            setUploadStatus('');
            setProductImages([]);
            setMultipleFiles([]);
            setMultiplePreviewUrls([]);
            // Si la création de produit échoue, affiche une erreur
        } catch (err) {
            setError(err.message);
            // Réinitialise l'état de chargement
        } finally {
            setLoading(false);
        }
    };

    /**
     * Ouvre le modal d'édition pour un produit spécifique
     * @param {Object} product - Le produit à éditer
     */
    const handleEditClick = (product) => {
        // Met à jour l'état du produit en cours d'édition et active le mode édition
        setEditingProduct({ ...product });
        // Active le mode édition
        setIsEditing(true);
    };

    /**
     * Ferme le modal d'édition
     */
    const handleCancelEdit = () => {
        // Réinitialise l'état d'édition et le produit en cours d'édition
        setIsEditing(false);
        // Réinitialise le produit en cours d'édition
        setEditingProduct(null);
    };

    /**
     * Gère les changements de champs dans le formulaire d'édition
     * @param {Event} e - L'événement de changement
     */
    const handleSaveEdit = async (updatedProduct) => {
        // Met à jour l'état de chargement
        setLoading(true);
        try {
            // Récupère le token JWT de l'authentification admin
            const token = localStorage.getItem('adminToken');
            // Envoie une requête PUT pour mettre à jour le produit
            const response = await fetch(`/api/products/${updatedProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProduct)
            });

            // Vérifie si la réponse est correcte
            // Si la réponse n'est pas correcte, lance une erreur
            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du produit');
            }

            // Récupère les données du produit mis à jour
            const data = await response.json();

            // Met à jour la liste des produits avec le produit modifié
            setProducts(products.map(p =>
                p._id === data._id ? data : p
            ));

            // Réinitialise l'état d'édition et le produit en cours d'édition
            setIsEditing(false);
            setEditingProduct(null);
            // Si la mise à jour échoue, affiche une erreur
        } catch (err) {
            setError(err.message);
            // Réinitialise l'état de chargement
        } finally {
            setLoading(false);
        }
    };

    /**
     * Supprime un produit
     * @param {string} productId - L'ID du produit à supprimer
     */
    const handleDeleteProduct = async (productId) => {
        // Vérifie si l'utilisateur confirme la suppression
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            return;
        }

        // Met à jour l'état de chargement
        setLoading(true);
        try {
            // Récupère le token JWT de l'authentification admin
            const token = localStorage.getItem('adminToken');
            // Envoie une requête DELETE pour supprimer le produit
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Vérifie si la réponse est correcte
            // Si la réponse n'est pas correcte, lance une erreur
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du produit');
            }

            // Enlever le produit de la liste
            setProducts(products.filter(p => p._id !== productId));

            // Si le produit en cours d'édition est supprimé, fermer le modal d'édition
            if (editingProduct && editingProduct._id === productId) {
                setIsEditing(false);
                setEditingProduct(null);
            }
            // Si la suppression échoue, affiche une erreur
        } catch (err) {
            setError(err.message);
            // Réinitialise l'état de chargement
        } finally {
            setLoading(false);
        }
    };

    // Si le chargement est en cours et qu'aucun produit n'est chargé, afficher un message de chargement
    if (loading && products.length === 0) {
        return <div className="loading">Chargement des produits...</div>;
    }

    return (
        <div className="admin-products">
            {error && <div className="error-message">{error}</div>}

            {/* Section de téléchargement d'image */}
            <section className="upload-section">
                <h3>Images du produit</h3>
                <form onSubmit={handleUploadMultiple} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="product-images">Sélectionner une ou plusieurs images</label>
                        <input
                            type="file"
                            id="product-images"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleFilesChange}
                            disabled={uploadingMultiple}
                        />
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

                    <button type="submit" disabled={multipleFiles.length === 0 || uploadingMultiple}>
                        {uploadingMultiple ? 'Téléchargement...' : 'Télécharger les images'}
                    </button>

                    {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
                </form>

                {/* Image Gallery */}
                {productImages.length > 0 && (
                    <div className="product-images-gallery">
                        <h4>Images sélectionnées pour ce produit</h4>
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
            </section>

            {/* Formulaire de création de produit */}
            <section className="product-form-section">
                <h3>Créer un Nouveau Produit</h3>
                <form onSubmit={handleCreateProduct} className="product-form">
                    {/* Champs de saisie pour le nom du produit */}
                    <div className="form-group">
                        <label htmlFor="name">Nom du produit*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={productForm.name}
                            onChange={handleProductInputChange}
                            required
                        />
                    </div>

                    {/* Champs de saisie pour la description du produit */}
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={productForm.description}
                            onChange={handleProductInputChange}
                        />
                    </div>

                    {/* Champs de saisie pour le prix du produit */}
                    <div className="form-group">
                        <label htmlFor="price">Prix*</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            min="0"
                            step="0.01"
                            value={productForm.price}
                            onChange={handleProductInputChange}
                            required
                        />
                    </div>

                    {/* Champ de saisie pour l'URL de l'image */}
                    {/* <div className="form-group">
                        <label htmlFor="imageUrl">URL de l'image</label>
                        <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            value={productForm.imageUrl}
                            onChange={handleProductInputChange}
                            readOnly
                        />
                        <p className="help-text">Téléchargez d'abord une image</p>
                    </div> */}

                    {/* Gestion de l'inventaire */}
                    <div className="inventory-management">
                        <h4>Gestion de l'inventaire</h4>

                        {/* Case à cocher pour indiquer si le produit est en stock */}
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="inStock"
                                    checked={productForm.inStock}
                                    onChange={handleProductInputChange}
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
                                    checked={productForm.isUnique}
                                    onChange={handleProductInputChange}
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
                                    value={productForm.stockQuantity !== null ? productForm.stockQuantity : ''}
                                    onChange={handleProductInputChange}
                                    disabled={!productForm.inStock || productForm.isUnique || productForm.unlimitedStock}
                                    placeholder={productForm.isUnique ? '1' : 'Quantité'}
                                />
                                <div className="form-group checkbox unlimited-stock">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="unlimitedStock"
                                            checked={productForm.unlimitedStock}
                                            onChange={handleProductInputChange}
                                            disabled={!productForm.inStock || productForm.isUnique}
                                        />
                                        Quantité illimitée
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de soumission pour créer le produit */}
                    <button type="submit" disabled={loading || productImages.length === 0}>
                        {loading ? 'Création...' : 'Créer Produit'}
                    </button>
                </form>
            </section>

            {/* Liste des produits */}
            <section className="products-list-section">
                <h3>Produits ({products.length})</h3>
                <div className="products-grid">
                    {products.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteProduct}
                            isAdmin={true}
                        />
                    ))}
                </div>
            </section>

            {/* Modal d'édition de produit */}
            {isEditing && editingProduct && (
                <ProductEditModal
                    product={editingProduct}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    loading={loading}
                />
            )}
        </div>
    );
}