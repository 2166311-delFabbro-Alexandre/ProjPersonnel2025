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
        inStock: true
    });

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

    /**
     * Gère le changement de fichier pour le téléchargement d'images.
     * Met à jour l'aperçu de l'image et le fichier sélectionné.
     * @param {*} e - L'événement de changement de fichier.
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Créer un aperçu de l'image sélectionnée
            const fileReader = new FileReader();
            // Utiliser FileReader pour lire le fichier et mettre à jour l'URL de prévisualisation
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
            // Lire le fichier comme une URL de données
            // Cela permet d'afficher un aperçu de l'image avant le téléchargement
            fileReader.readAsDataURL(file);
        }
    };

    /**
     * Gère le téléchargement de l'image sélectionnée vers Cloudinary.
     * Envoie le fichier à l'API de téléchargement et met à jour l'URL de l'image dans le formulaire du produit.
     * @param {*} e - L'événement de soumission du formulaire.
     */
    const handleUpload = async (e) => {
        e.preventDefault();

        // Vérifie si un fichier a été sélectionné
        // Si aucun fichier n'est sélectionné, change le statut du téléchargement
        if (!selectedFile) {
            setUploadStatus('Veuillez sélectionner une image');
            return;
        }

        // Met à jour le statut du téléchargement et active le chargement
        setUploadStatus('Téléchargement en cours...');
        setLoading(true);

        try {
            // Instancie un objet FormData pour envoyer le fichier
            const formData = new FormData();
            // Ajoute le fichier sélectionné et le dossier à FormData
            formData.append('image', selectedFile);
            formData.append('folder', 'products');

            // Récupère le token JWT de l'authentification admin
            const token = localStorage.getItem('adminToken');
            // Envoie le fichier à l'API de téléchargement
            // Utilise fetch pour envoyer une requête POST à l'API de téléchargement
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Vérifie si la réponse est correcte
            // Si la réponse n'est pas correcte, lance une erreur
            if (!response.ok) {
                throw new Error('Échec du téléchargement');
            }

            // Récupère les données de la réponse
            // Si le téléchargement est réussi, met à jour le statut du téléchargement
            const data = await response.json();
            setUploadStatus('Image téléchargée avec succès!');

            // Insère l'URL de l'image dans le formulaire du produit
            setProductForm({
                ...productForm,
                imageUrl: data.imageUrl
            });
            // Si une erreur se produit, met à jour le statut du téléchargement
        } catch (err) {
            setUploadStatus(`Erreur: ${err.message}`);
            // Réinitialise l'état de chargement
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère les changements dans le formulaire de création de produit.
     * @param {*} e - L'événement de changement.
     */
    const handleProductInputChange = (e) => {
        // Met à jour l'état du formulaire de produit en fonction des changements
        const { name, value, type, checked } = e.target;
        // Met à jour le formulaire de produit avec les nouvelles valeurs
        setProductForm({
            ...productForm,
            [name]: type === 'checkbox' ? checked : value
        });
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
                body: JSON.stringify(productForm)
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
                inStock: true
            });
            // Réinitialiser le fichier sélectionné, l'aperçu de l'image et le statut de téléchargement
            setSelectedFile(null);
            setPreviewUrl('');
            setUploadStatus('');
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
                <h3>Télécharger une Image</h3>
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="image">Sélectionner une image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                    </div>

                    {previewUrl && (
                        <div className="image-preview">
                            <img src={previewUrl} alt="Aperçu" width="200" />
                        </div>
                    )}

                    <button type="submit" disabled={!selectedFile || loading}>
                        {loading ? 'Téléchargement...' : 'Télécharger'}
                    </button>

                    {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
                </form>
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
                    <div className="form-group">
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
                    </div>

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

                    {/* Bouton de soumission pour créer le produit */}
                    <button type="submit" disabled={loading || !productForm.imageUrl}>
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