import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import ProductEditModal from './ProductEditModal';
import './AdminProducts.css';

/**
 * Composant pour la gestion des produits dans le tableau de bord administrateur
 * @returns {JSX.Element} - Le composant de gestion des produits
 */
export default function AdminProducts() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { logout } = useAuth();

    const [products, setProducts] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        inStock: true
    });

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
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result);
            };
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

        if (!selectedFile) {
            setUploadStatus('Veuillez sélectionner une image');
            return;
        }

        setUploadStatus('Téléchargement en cours...');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('folder', 'products');

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
            setUploadStatus('Image téléchargée avec succès!');

            // Insère l'URL de l'image dans le formulaire du produit
            setProductForm({
                ...productForm,
                imageUrl: data.imageUrl
            });
        } catch (err) {
            setUploadStatus(`Erreur: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère les changements dans le formulaire de création de produit.
     * @param {*} e - L'événement de changement.
     */
    const handleProductInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm({
            ...productForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    /**
     * Gère la création d'un produit.
     * @param {*} e - L'événement de soumission du formulaire.
     * @returns 
     */
    const handleCreateProduct = async (e) => {
        e.preventDefault();

        if (!productForm.name || !productForm.price) {
            setError('Nom et prix sont obligatoires');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productForm)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du produit');
            }

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
            setSelectedFile(null);
            setPreviewUrl('');
            setUploadStatus('');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Ouvre le modal d'édition pour un produit spécifique
     * @param {Object} product - Le produit à éditer
     */
    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setIsEditing(true);
    };

    /**
     * Ferme le modal d'édition et réinitialise l'état d'édition
     */
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingProduct(null);
    };

    /**
     * Gère les changements de champs dans le formulaire d'édition
     * @param {Event} e - L'événement de changement
     */
    const handleSaveEdit = async (updatedProduct) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/products/${updatedProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProduct)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du produit');
            }

            const data = await response.json();

            setProducts(products.map(p =>
                p._id === data._id ? data : p
            ));

            setIsEditing(false);
            setEditingProduct(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Supprime un produit
     * @param {string} productId - L'ID du produit à supprimer
     */
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={productForm.description}
                            onChange={handleProductInputChange}
                        />
                    </div>

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