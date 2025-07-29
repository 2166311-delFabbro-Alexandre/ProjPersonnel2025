import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Soins.css';

export default function Soins() {
    const [pageContent, setPageContent] = useState({
        title: 'Soins pour Tatouages',
        content: 'Chargement des instructions de soins...'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    // Function to safely render HTML content
    const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="soins-container">
            <h1>{pageContent.title}</h1>

            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div
                    className="soins-content"
                    dangerouslySetInnerHTML={createMarkup(pageContent.content)}
                />
            )}

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