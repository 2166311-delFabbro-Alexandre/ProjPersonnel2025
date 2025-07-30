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

// Create a sortable item component
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

export default function AdminPortfolio() {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const { logout } = useAuth();

    // Set up drag sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Form state for adding/editing items
    const [formData, setFormData] = useState({
        title: '',
        featured: false,
        imageUrl: '',
        imageFile: null
    });

    useEffect(() => {
        fetchPortfolioItems();
    }, []);

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

    // Keep all your existing handlers (handleInputChange, handleImageChange, resetForm, etc.)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({
                ...formData,
                imageFile: e.target.files[0],
                imageUrl: URL.createObjectURL(e.target.files[0])
            });
        }
    };

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

    // All your existing handlers for add, edit, update, delete...
    const handleAddItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // First upload the image if there's a file
            let finalImageUrl = formData.imageUrl;

            if (formData.imageFile) {
                const formDataWithImage = new FormData();
                formDataWithImage.append('image', formData.imageFile);
                formDataWithImage.append('folder', 'portfolio');

                setLoading(true);

                try {
                    const token = localStorage.getItem('adminToken');
                    const uploadResponse = await fetch('/api/upload', {
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

            // Now create the portfolio item with the image URL
            const token = localStorage.getItem('adminToken');
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

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de l\'ajout de l\'élément au portfolio');
            }

            const data = await response.json();
            setSuccess('Élément ajouté au portfolio avec succès!');
            setPortfolioItems([...portfolioItems, data.item]);
            resetForm();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error adding portfolio item:', err);
            setError(err.message || 'Erreur lors de l\'ajout de l\'élément.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditItem = (item) => {
        setFormData({
            title: item.title,
            featured: item.featured || false,
            imageUrl: item.imageUrl,
            imageFile: null
        });
        setEditingItem(item);
        setShowAddForm(true);
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // First upload the image if there's a new file
            let finalImageUrl = formData.imageUrl;

            if (formData.imageFile) {
                const formDataWithImage = new FormData();
                formDataWithImage.append('image', formData.imageFile); // Changed to 'image'
                formDataWithImage.append('folder', 'portfolio');

                try {
                    const token = localStorage.getItem('adminToken');
                    const uploadResponse = await fetch('/api/upload', {
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

            // Now update the portfolio item
            const token = localStorage.getItem('adminToken');
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

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de la mise à jour de l\'élément');
            }

            const data = await response.json();

            // Update item in state
            setPortfolioItems(portfolioItems.map(item =>
                item._id === editingItem._id ? data.item : item
            ));

            setSuccess('Élément mis à jour avec succès!');
            resetForm();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating portfolio item:', err);
            setError(err.message || 'Erreur lors de la mise à jour de l\'élément.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément du portfolio?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/portfolio/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de la suppression de l\'élément');
            }

            // Remove the item from state
            setPortfolioItems(portfolioItems.filter(item => item._id !== id));
            setSuccess('Élément supprimé avec succès!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting portfolio item:', err);
            setError(err.message || 'Erreur lors de la suppression de l\'élément.');
        } finally {
            setLoading(false);
        }
    };

    // New handlers for dnd-kit
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

            // Update the server
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

                    // If there's an error, revert to original order
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

    if (loading && portfolioItems.length === 0) {
        return <div className="loading">Chargement du portfolio...</div>;
    }

    return (
        <div className="admin-portfolio">
            <h2>Gestion du Portfolio</h2>

            <div className="portfolio-actions">
                <button
                    className="add-portfolio-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Annuler' : 'Ajouter un élément'}
                </button>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </div>

            {showAddForm && (
                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="portfolio-form">
                    <h3>{editingItem ? 'Modifier l\'élément' : 'Ajouter un nouvel élément'}</h3>

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

                    {formData.imageUrl && (
                        <div className="image-preview">
                            <img src={formData.imageUrl} alt="Aperçu" />
                        </div>
                    )}

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

            <div className="portfolio-items-container">
                <h3>Éléments du Portfolio (Glisser-déposer pour réorganiser)</h3>

                {portfolioItems.length === 0 ? (
                    <p className="no-items">Aucun élément dans le portfolio.</p>
                ) : (
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
                )}
            </div>
        </div>
    );
}