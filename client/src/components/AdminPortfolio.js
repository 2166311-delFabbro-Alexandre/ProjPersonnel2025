import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../context/AuthContext';
import './AdminPortfolio.css';

/**
 * Composant d'élément de portfolio réorganisable.
 * 
 * @param {Object} item - L'élément du portfolio à afficher.
 * @param {Function} onEdit - Fonction pour éditer l'élément.
 * @param {Function} onDelete - Fonction pour supprimer l'élément.
 * 
 * @returns {JSX.Element} - Le composant d'élément de portfolio réorganisable.
 * 
 * Code généré par GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
function SortablePortfolioItem({ item, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: item._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`portfolio-item-card ${item.featured ? 'featured' : ''}`}
        >
            <div className="drag-handle" {...attributes} {...listeners}>
                ⋮⋮
            </div>
            <div className="item-image">
                <img src={item.imageUrl} alt={item.title} />
            </div>
            <div className="item-details">
                <h4>{item.title}</h4>
            </div>
            <div className="item-actions">
                <button
                    className="edit-btn"
                    onClick={() => onEdit(item)}
                >
                    Modifier
                </button>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(item._id)}
                >
                    Supprimer
                </button>
            </div>
        </div>
    );
}

/**
 * Composant de gestion du portfolio pour les administrateurs.
 * Permet aux administrateurs d'ajouter, modifier et supprimer des éléments du portfolio.
 * @returns {JSX.Element} - Le composant de gestion du portfolio administrateur.
 *
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function AdminPortfolio() {
    // État pour stocker les éléments du portfolio
    const [portfolioItems, setPortfolioItems] = useState([]);
    // États pour gérer le chargement, les erreurs et les messages de succès
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // État pour gérer l'élément en cours d'édition
    const [editingItem, setEditingItem] = useState(null);
    // État pour gérer l'affichage du formulaire d'ajout
    const [showAddForm, setShowAddForm] = useState(false);
    // État pour gérer l'ID de l'élément actif lors du glisser-déposer
    const [activeId, setActiveId] = useState(null);
    // Authentification pour les actions d'administration
    const { logout } = useAuth();

    // Utilisation des capteurs pour le glisser-déposer
    // Utilisation de DnD Kit pour gérer le glisser-déposer des éléments du portfolio
    // Code généré par GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    // Fin code généré

    // État pour le formulaire d'ajout/édition
    const [formData, setFormData] = useState({
        title: '',
        featured: false,
        imageUrl: '',
        imageFile: null
    });

    // Chargement des éléments du portfolio au chargement du composant
    useEffect(() => {
        fetchPortfolioItems();
    }, []);

    // Fonction pour récupérer les éléments du portfolio depuis le serveur
    const fetchPortfolioItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/portfolio');

            if (!response.ok) {
                throw new Error('Erreur lors du chargement du portfolio');
            }

            const data = await response.json();
            setPortfolioItems(data);
        } catch (err) {
            console.error('Error fetching portfolio:', err);
            setError('Impossible de charger le portfolio.');
        } finally {
            setLoading(false);
        }
    };

    // Gestion des changements dans les champs du formulaire
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Gestion du changement d'image
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({
                ...formData,
                imageFile: e.target.files[0],
                imageUrl: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    // Réinitialisation du formulaire après ajout ou modification
    const resetForm = () => {
        setFormData({
            title: '',
            featured: false,
            imageUrl: '',
            imageFile: null
        });
        setEditingItem(null);
        setShowAddForm(false);
    };

    // Fonction pour ajouter un nouvel élément au portfolio
    const handleAddItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // L'url de l'image
            let finalImageUrl = formData.imageUrl;

            // Si une nouvelle image est sélectionnée, on l'envoie au serveur
            if (formData.imageFile) {
                const formDataWithImage = new FormData();
                formDataWithImage.append('image', formData.imageFile);

                setLoading(true);

                try {
                    const token = localStorage.getItem('adminToken');
                    const uploadResponse = await fetch(`/api/upload?folder=portfolio`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formDataWithImage
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Erreur lors du téléchargement de l\'image');
                    }

                    const uploadData = await uploadResponse.json();
                    finalImageUrl = uploadData.imageUrl;
                } catch (err) {
                    throw new Error('Erreur lors du téléchargement: ' + err.message);
                }
            }

            // Le token d'authentification pour l'ajout de l'élément
            const token = localStorage.getItem('adminToken');
            // Envoi de la requête pour ajouter l'élément au portfolio
            const response = await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    featured: formData.featured,
                    imageUrl: finalImageUrl
                })
            });

            // Si la réponse n'est pas correcte, on gère les erreurs
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de l\'ajout de l\'élément au portfolio');
            }

            // Récupération des données de la réponse
            const data = await response.json();
            // Mise à jour de l'état de succès
            setSuccess('Élément ajouté au portfolio avec succès!');
            // Ajout de l'élément au tableau des éléments du portfolio
            setPortfolioItems([...portfolioItems, data.item]);
            // Réinitialisation du formulaire
            resetForm();

            // Enlever le message de succès après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
            // Si une erreur survient, on l'affiche
        } catch (err) {
            console.error('Error adding portfolio item:', err);
            setError(err.message || 'Erreur lors de l\'ajout de l\'élément.');
        } finally {
            // Réinitialisation de l'état de chargement
            setLoading(false);
        }
    };

    // Fonction pour éditer un élément du portfolio
    const handleEditItem = (item) => {
        // Remplissage du formulaire avec les données de l'élément à éditer
        setFormData({
            title: item.title,
            featured: item.featured || false,
            imageUrl: item.imageUrl,
            imageFile: null
        });
        // Mise à jour de l'élément en cours d'édition
        setEditingItem(item);
        // Affichage du formulaire d'ajout/édition
        setShowAddForm(true);
    };

    // Fonction pour mettre à jour un élément du portfolio
    const handleUpdateItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Url de l'image
            let finalImageUrl = formData.imageUrl;

            // Si une nouvelle image est sélectionnée, on l'envoie au serveur
            if (formData.imageFile) {
                const formDataWithImage = new FormData();
                formDataWithImage.append('image', formData.imageFile);

                try {
                    const token = localStorage.getItem('adminToken');
                    const uploadResponse = await fetch(`/api/upload?folder=portfolio`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formDataWithImage
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Erreur lors du téléchargement de l\'image');
                    }

                    const uploadData = await uploadResponse.json();
                    finalImageUrl = uploadData.imageUrl;
                } catch (err) {
                    throw new Error('Erreur lors du téléchargement: ' + err.message);
                }
            }

            // Le token d'authentification pour la mise à jour de l'élément
            const token = localStorage.getItem('adminToken');
            // Envoi de la requête pour mettre à jour l'élément du portfolio
            const response = await fetch(`/api/portfolio/${editingItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    featured: formData.featured,
                    ...(formData.imageFile && { imageUrl: finalImageUrl })
                })
            });

            // Si la réponse n'est pas correcte, on gère les erreurs
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de la mise à jour de l\'élément');
            }

            // Récupération des données de la réponse
            const data = await response.json();

            // Mise à jour de l'état des éléments du portfolio
            setPortfolioItems(portfolioItems.map(item =>
                item._id === editingItem._id ? data.item : item
            ));

            // Mise à jour de l'état de succès
            setSuccess('Élément mis à jour avec succès!');
            // Réinitialisation du formulaire
            resetForm();

            // Enlever le message de succès après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
            // Si une erreur survient, on l'affiche
        } catch (err) {
            console.error('Error updating portfolio item:', err);
            setError(err.message || 'Erreur lors de la mise à jour de l\'élément.');
        } finally {
            // Réinitialisation de l'état de chargement
            setLoading(false);
        }
    };

    // Fonction pour supprimer un élément du portfolio
    const handleDeleteItem = async (id) => {
        // Confirmation de la suppression
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément du portfolio?')) {
            return;
        }

        // Mise à jour de l'état de chargement et d'erreur
        setLoading(true);
        // Réinitialisation des messages d'erreur et de succès
        setError('');

        try {
            // Le token d'authentification pour la suppression de l'élément
            const token = localStorage.getItem('adminToken');
            // Envoi de la requête pour supprimer l'élément du portfolio
            const response = await fetch(`/api/portfolio/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si la réponse n'est pas correcte, on gère les erreurs
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de la suppression de l\'élément');
            }

            // Suppression de l'élément de l'état
            setPortfolioItems(portfolioItems.filter(item => item._id !== id));
            // Mise à jour de l'état de succès
            setSuccess('Élément supprimé avec succès!');

            // Enlever le message de succès après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
            // Si une erreur survient, on l'affiche
        } catch (err) {
            console.error('Error deleting portfolio item:', err);
            setError(err.message || 'Erreur lors de la suppression de l\'élément.');
        } finally {
            // Réinitialisation de l'état de chargement
            setLoading(false);
        }
    };

    // Gestion du début du glisser-déposer
    // Code généré par GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPortfolioItems((items) => {
                const oldIndex = items.findIndex(item => item._id === active.id);
                const newIndex = items.findIndex(item => item._id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });

            try {
                const updatedItems = [...portfolioItems];
                const oldIndex = updatedItems.findIndex(item => item._id === active.id);
                const newIndex = updatedItems.findIndex(item => item._id === over.id);
                const reorderedItems = arrayMove(updatedItems, oldIndex, newIndex);

                const token = localStorage.getItem('adminToken');
                const response = await fetch('/api/portfolio/reorder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        items: reorderedItems.map((item, index) => ({
                            id: item._id,
                            displayOrder: index
                        }))
                    })
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        logout();
                        throw new Error('Session expirée. Veuillez vous reconnecter.');
                    }

                    fetchPortfolioItems();
                    throw new Error('Erreur lors de la réorganisation des éléments');
                }
            } catch (err) {
                console.error('Error reordering items:', err);
                setError(err.message || 'Erreur lors de la réorganisation des éléments.');
            }
        }

        setActiveId(null);
    };
    // Fin code généré

    // Si le chargement est en cours et qu'il n'y a pas d'éléments dans le portfolio, on affiche un message de chargement
    if (loading && portfolioItems.length === 0) {
        return <div className="loading">Chargement du portfolio...</div>;
    }

    return (
        <div className="admin-portfolio">
            <h2>Gestion du Portfolio</h2>

            <div className="portfolio-actions">
                { /* Bouton pour afficher le formulaire d'ajout d'un nouvel élément ou annuler l'ajout/modification en cours */}
                <button
                    className="add-portfolio-btn"
                    onClick={() => {
                        // Si le formulaire d'ajout est déjà affiché, on le réinitialise et on le cache
                        if (showAddForm) {
                            resetForm();
                            setShowAddForm(false);
                        } else {
                            setShowAddForm(true);
                        }
                    }}
                >
                    {showAddForm ? 'Annuler' : 'Ajouter un élément'}
                </button>

                {/* Affichage des messages d'erreur ou de succès */}
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </div>

            {/* Formulaire d'ajout ou de modification d'un élément du portfolio */}
            {showAddForm && (
                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="portfolio-form">
                    <h3>{editingItem ? 'Modifier l\'élément' : 'Ajouter un nouvel élément'}</h3>

                    { /* Champ de saisie pour le titre de l'élément du portfolio */}
                    <div className="form-group">
                        <label htmlFor="title">Titre:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Case à cocher pour indiquer si l'élément est mis en avant */}
                    <div className="form-check">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="featured">Élément mis en avant (plus grand)</label>
                    </div>

                    {/* Champ de saisie pour l'image de l'élément du portfolio */}
                    {/* Si l'élément est en cours d'édition, l'image actuelle est affichée */}
                    <div className="form-group">
                        <label htmlFor="image">Image:</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="file-input"
                            {...(!editingItem && { required: true })}
                        />
                    </div>

                    {/* Affichage de l'aperçu de l'image si une image est sélectionnée */}
                    {formData.imageUrl && (
                        <div className="image-preview">
                            <img src={formData.imageUrl} alt="Aperçu" />
                        </div>
                    )}

                    {/* Boutons pour soumettre le formulaire ou annuler l'ajout/modification */}
                    <div className="form-buttons">
                        <button type="button" className="cancel-btn" onClick={resetForm}>
                            Annuler
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Traitement...' : (editingItem ? 'Mettre à jour' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            )}

            {/* Affichage des éléments du portfolio avec la possibilité de les réorganiser */}
            <div className="portfolio-items-container">
                <h3>Éléments du Portfolio (Glisser-déposer pour réorganiser)</h3>


                {portfolioItems.length === 0 ? (
                    <p className="no-items">Aucun élément dans le portfolio.</p>
                ) : (
                    /**
                     * Utilisation de DnD Kit pour permettre le glisser-déposer des éléments du portfolio
                     * Code généré par GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
                     */
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={portfolioItems.map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="portfolio-items-list">
                                {portfolioItems.map((item) => (
                                    <SortablePortfolioItem
                                        key={item._id}
                                        item={item}
                                        onEdit={handleEditItem}
                                        onDelete={handleDeleteItem}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    // Fin du code généré
                )}
            </div>
        </div>
    );
}