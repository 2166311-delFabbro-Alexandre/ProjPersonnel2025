import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminContentEditor.css';

export default function AdminContentEditor() {
    const [pages, setPages] = useState([
        { id: 'soins', name: 'Soins pour Tatouages' }
    ]);
    const [selectedPage, setSelectedPage] = useState('soins');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        loadPageContent(selectedPage);
    }, [selectedPage]);

    const loadPageContent = async (pageId) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/page-content/${pageId}`);

            if (response.ok) {
                const data = await response.json();
                setTitle(data.title);
                setContent(data.content);
            } else if (response.status === 404) {
                // Create default content for new pages
                if (pageId === 'soins') {
                    setTitle('Soins pour Tatouages');
                    setContent(`<h3>Instructions pour prendre soin de votre nouveau tatouage</h3>
                        <p>Le contenu détaillé des instructions sera bientôt disponible.</p>
                        <p>En attendant, veuillez suivre les instructions fournies par votre artiste tatoueur.</p>`);
                } else {
                    setTitle('Nouvelle Page');
                    setContent('<p>Contenu de la page à éditer ici.</p>');
                }
            } else {
                throw new Error('Erreur lors du chargement du contenu');
            }
        } catch (err) {
            console.error('Error loading page content:', err);
            setError('Impossible de charger le contenu. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveContent = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`/api/page-content/${selectedPage}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors de la sauvegarde du contenu');
            }

            const data = await response.json();
            setSuccess('Contenu sauvegardé avec succès!');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error saving content:', err);
            setError(err.message || 'Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            setSaving(false);
        }
    };

    const handleContentChange = (e) => {
        setContent(e.target.value);
    };

    return (
        <div className="admin-content-editor">
            <h2>Éditeur de Contenu</h2>

            <div className="page-selector">
                <label htmlFor="page-select">Sélectionner une page:</label>
                <select
                    id="page-select"
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                >
                    {pages.map(page => (
                        <option key={page.id} value={page.id}>
                            {page.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading">Chargement du contenu...</div>
            ) : (
                <form onSubmit={handleSaveContent} className="content-form">
                    <div className="form-group">
                        <label htmlFor="page-title">Titre de la page:</label>
                        <input
                            type="text"
                            id="page-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="page-content">Contenu de la page (HTML):</label>
                        <textarea
                            id="page-content"
                            value={content}
                            onChange={handleContentChange}
                            rows="15"
                            required
                        />
                        <p className="help-text">
                            Vous pouvez utiliser du HTML pour formater le contenu.
                            Exemple: &lt;h3&gt;Titre&lt;/h3&gt;, &lt;p&gt;Paragraphe&lt;/p&gt;,
                            &lt;ul&gt;&lt;li&gt;Élément de liste&lt;/li&gt;&lt;/ul&gt;
                        </p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="content-preview">
                        <h3>Aperçu:</h3>
                        <div className="preview-container">
                            <h2>{title}</h2>
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="save-button"
                        disabled={saving}
                    >
                        {saving ? 'Sauvegarde en cours...' : 'Sauvegarder le contenu'}
                    </button>
                </form>
            )}
        </div>
    );
}