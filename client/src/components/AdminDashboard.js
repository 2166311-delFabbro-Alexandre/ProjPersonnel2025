import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

/**
 * Page de tableau de bord pour les administrateurs.
 * Affiche les données du tableau de bord, permet le téléchargement d'images
 * @returns {JSX.Element} - Le composant de tableau de bord administrateur.
 */
export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();

    const [products, setProducts] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        inStock: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        fetchProducts();
    }, []);

    /**
     * Récupère les données du tableau de bord pour l'administrateur.
     * Gère les erreurs de session expirée et les erreurs de chargement.
     */
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');

            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur de chargement des données');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Récupère la liste des produits.
     */
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des produits');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
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
    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingProduct({
            ...editingProduct,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    /**
     * Soumet les modifications d'un produit au serveur
     * @param {Event} e - L'événement de soumission du formulaire
     */
    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        if (!editingProduct.name || !editingProduct.price) {
            setError('Nom et prix sont obligatoires');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/products/${editingProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingProduct)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du produit');
            }

            const updatedProduct = await response.json();

            // Update the products list with the edited product
            setProducts(products.map(p =>
                p._id === updatedProduct._id ? updatedProduct : p
            ));

            // Close the edit modal
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

            // Remove the deleted product from the list
            setProducts(products.filter(p => p._id !== productId));

            // If we're editing this product, close the modal
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

    if (loading && !dashboardData) return <div>Chargement...</div>;
    if (error && !dashboardData) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-dashboard">
            <h2>Tableau de bord Admin</h2>

            {dashboardData && (
                <div className="dashboard-data">
                    <p>{dashboardData.message}</p>
                    <p>Connecté en tant que: {dashboardData.user?.username}</p>
                </div>
            )}

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
                        <div key={product._id} className="product-card">
                            {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} />
                            )}
                            <h4>{product.name}</h4>
                            <p className="price">{product.price.toFixed(2)} $</p>
                            <p className="stock">
                                {product.inStock ? 'En stock' : 'Rupture de stock'}
                            </p>
                            <div className="product-actions">
                                <button
                                    onClick={() => handleEditClick(product)}
                                    className="edit-button"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="delete-button"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <button onClick={logout} className="logout-button">
                Se déconnecter
            </button>

            {isEditing && editingProduct && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <h3>Modifier le Produit</h3>

                        <form onSubmit={handleUpdateProduct} className="edit-form">
                            <div className="form-group">
                                <label htmlFor="edit-name">Nom du produit*</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={editingProduct.name}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-description">Description</label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={editingProduct.description || ''}
                                    onChange={handleEditInputChange}
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
                                    value={editingProduct.price}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-imageUrl">URL de l'image</label>
                                <input
                                    type="text"
                                    id="edit-imageUrl"
                                    name="imageUrl"
                                    value={editingProduct.imageUrl || ''}
                                    onChange={handleEditInputChange}
                                />
                                {editingProduct.imageUrl && (
                                    <div className="image-preview">
                                        <img src={editingProduct.imageUrl} alt="Aperçu" width="100" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="inStock"
                                        checked={editingProduct.inStock}
                                        onChange={handleEditInputChange}
                                    />
                                    En stock
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" disabled={loading} className="save-button">
                                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="cancel-button"
                                    disabled={loading}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}