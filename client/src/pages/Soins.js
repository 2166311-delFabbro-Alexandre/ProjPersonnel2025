import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Soins.css';

/**
 * Page de soins pour tatouages.
 * Affiche des instructions sur les soins à apporter aux tatouages.
 * 
 * @returns {JSX.Element} - La page de soins pour tatouages.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function Soins() {
    // États pour gérer le contenu de la page, le chargement et les erreurs
    const [pageContent, setPageContent] = useState({
        title: 'Soins pour Tatouages',
        content: 'Chargement des instructions de soins...'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Effet pour charger le contenu de la page depuis l'API
    useEffect(() => {
        const fetchPageContent = async () => {
            try {
                const response = await fetch('/api/page-content/soins');

                if (response.ok) {
                    const data = await response.json();
                    setPageContent(data);
                } else if (response.status === 404) {
                    // Using default content if page doesn't exist yet
                    setPageContent({
                        title: 'Soins pour Tatouages',
                        content: `<h3>Instructions pour prendre soin de votre nouveau tatouage</h3>
                            <p>Le contenu détaillé des instructions sera bientôt disponible.</p>
                            <p>En attendant, veuillez suivre les instructions fournies par votre artiste tatoueur.</p>`
                    });
                } else {
                    throw new Error('Erreur lors du chargement du contenu');
                }
            } catch (err) {
                console.error('Error fetching aftercare content:', err);
                setError('Impossible de charger le contenu. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        fetchPageContent();
    }, []);

    /**
     * Crée un objet de rendu sécurisé pour le contenu HTML.
     * 
     * @param {*} htmlContent - Le contenu HTML à rendre.
     * 
     * @returns {Object} - L'objet de rendu sécurisé.
     */
    const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
    };

    // Affiche un message de chargement
    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="soins-container">
            {/* Affiche le titre de la page */}
            <h1>{pageContent.title}</h1>

            {/* Affiche le contenu de la page ou un message d'erreur */}
            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div
                    className="soins-content"
                    dangerouslySetInnerHTML={createMarkup(pageContent.content)}
                />
            )}

            {/* Liens de navigation pour aller à la boutique ou à l'accueil */}
            <div className="page-navigation">
                <Link to="/shop" className="nav-button">
                    Voir nos produits recommandés
                </Link>
                <Link to="/" className="nav-button">
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
}