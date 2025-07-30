import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminContentEditor.css';

/**
 * Composant pour éditer le contenu des pages
 * @returns {JSX.Element} - Composant d'édition de contenu
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function AdminContentEditor() {
    // State pour gérer les pages, le contenu, les erreurs et les messages de succès
    const [pages, setPages] = useState([
        { id: 'soins', name: 'Soins pour Tatouages' }
    ]);
    // State pour la page sélectionnée
    const [selectedPage, setSelectedPage] = useState('soins');
    // State pour le titre de la page
    const [title, setTitle] = useState('');
    // State pour le contenu de la page
    const [content, setContent] = useState('');
    // State pour gérer le chargement
    const [loading, setLoading] = useState(false);
    // State pour gérer la sauvegarde
    const [saving, setSaving] = useState(false);
    // State pour les message d'erreur
    const [error, setError] = useState('');
    // State pour les messages de succès
    const [success, setSuccess] = useState('');
    // Hook pour gérer l'authentification
    const { logout } = useAuth();

    // Charger le contenu de la page sélectionnée au chargement du composant et à chaque changement de page
    useEffect(() => {
        loadPageContent(selectedPage);
    }, [selectedPage]);

    // Fonction pour charger le contenu de la page depuis l'API
    const loadPageContent = async (pageId) => {
        setLoading(true);
        setError('');

        try {
            // Appel à l'API pour récupérer le contenu de la page
            const response = await fetch(`/api/page-content/${pageId}`);

            // Vérifier si la réponse est OK
            if (response.ok) {
                // Extraire les données de la réponse
                const data = await response.json();
                // Mettre à jour le titre et le contenu avec les données récupérées
                setTitle(data.title);
                setContent(data.content);
                // Si la page n'existe pas, créer un contenu par défaut
            } else if (response.status === 404) {
                // Création de contenu par défaut
                setTitle('Nouvelle Page');
                setContent(
                    `<div class="html-guide">
                            <h3>Guide d'utilisation de l'éditeur HTML</h3>
                        
                            <p>Vous pouvez formater votre contenu en utilisant des balises HTML. Voici quelques exemples :</p>
                        
                            <h4>Titres</h4>
                            <pre>
                                &lt;h1&gt;Titre principal&lt;/h1&gt;
                                &lt;h2&gt;Sous-titre&lt;/h2&gt;
                                &lt;h3&gt;Titre de section&lt;/h3&gt;
                            </pre>
                        
                            <h4>Paragraphes et formatage</h4>
                            <pre>
                                &lt;p&gt;Ceci est un paragraphe.&lt;/p&gt;
                                &lt;p&gt;Du texte &lt;strong&gt;en gras&lt;/strong&gt; et &lt;em&gt;en italique&lt;/em&gt;.&lt;/p&gt;
                                &lt;p&gt;Lien: &lt;a href="https://exemple.com"&gt;Cliquez ici&lt;/a&gt;&lt;/p&gt;
                            </pre>

                            <h4>Listes</h4>
                            <pre>
                                &lt;ul&gt;
                                &lt;li&gt;Élément de liste à puces&lt;/li&gt;
                                &lt;li&gt;Autre élément&lt;/li&gt;
                                &lt;/ul&gt;

                                &lt;ol&gt;
                                &lt;li&gt;Élément de liste numérotée&lt;/li&gt;
                                &lt;li&gt;Second élément&lt;/li&gt;
                                &lt;/ol&gt;
                            </pre>
                        
                            <h4>Images</h4>
                            <pre>
                                &lt;img src="URL_DE_VOTRE_IMAGE" alt="Description de l'image" /&gt;
                            </pre>
                        
                            <p>Commencez à éditer votre contenu en remplaçant ce texte par le contenu de votre page.</p>
                        </div>`
                );
                // Si la réponse n'est pas OK ou 404, gérer les erreurs
            } else {
                throw new Error('Erreur lors du chargement du contenu');
            }
            // Si une erreur se produit, afficher un message d'erreur
        } catch (err) {
            console.error('Error loading page content:', err);
            setError('Impossible de charger le contenu. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour sauvegarder le contenu de la page
    const handleSaveContent = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('adminToken');

            // PUT request pour sauvegarder le contenu de la page
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

            // Vérifier si la réponse est OK
            if (!response.ok) {
                // Si la réponse est 401 ou 403, déconnecter l'utilisateur
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                // Si la réponse n'est pas OK, lancer une erreur
                throw new Error('Erreur lors de la sauvegarde du contenu');
            }

            const data = await response.json();
            // Message de succès après la sauvegarde
            setSuccess('Contenu sauvegardé avec succès!');

            // Enlever le message de succès après 3 secondes
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            // Si une erreur se produit, afficher un message d'erreur
        } catch (err) {
            console.error('Error saving content:', err);
            setError(err.message || 'Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            // Réinitialiser l'état de sauvegarde
            setSaving(false);
        }
    };

    // Fonction pour gérer les changements dans le contenu de la page
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