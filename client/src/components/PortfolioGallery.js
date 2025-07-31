import React, { useState, useEffect } from 'react';
import './PortfolioGallery.css';

/**
 * Composant pour afficher une galerie de portfolio.
 * Permet aux utilisateurs de visualiser les éléments du portfolio.
 * @returns {JSX.Element} - Le composant de la galerie de portfolio.
 *
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function PortfolioGallery() {
    // État pour stocker les éléments du portfolio
    const [portfolioItems, setPortfolioItems] = useState([]);
    // États pour gérer le chargement et les erreurs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // État pour gérer l'élément sélectionné pour la visualisation en modal
    const [selectedItem, setSelectedItem] = useState(null);

    // Effet pour charger les éléments du portfolio lors du montage du composant
    useEffect(() => {
        fetchPortfolioItems();
    }, []);

    // Fonction pour récupérer les éléments du portfolio depuis l'API
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
            setError('Impossible de charger le portfolio. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour gérer le clic sur une image du portfolio
    const handleImageClick = (item) => {
        setSelectedItem(item);
    };

    // Fonction pour fermer la modal
    const closeModal = () => {
        setSelectedItem(null);
    };

    // Si le chargement est en cours, affiche un message de chargement
    if (loading) {
        return <div className="portfolio-loading">Chargement du portfolio...</div>;
    }

    // Si une erreur est survenue, affiche un message d'erreur
    if (error) {
        return <div className="portfolio-error">{error}</div>;
    }

    // Si aucun élément n'est disponible, affiche un message approprié
    if (portfolioItems.length === 0) {
        return <div className="portfolio-empty">Aucun élément dans le portfolio pour le moment.</div>;
    }

    // Trie les éléments du portfolio par ordre d'affichage
    const sortedItems = [...portfolioItems].sort((a, b) => a.displayOrder - b.displayOrder);

    // Rendu du composant de la galerie de portfolio
    return (
        <div className="portfolio-section">
            <h2 className="portfolio-title">Portfolio</h2>

            {/* Affiche les éléments du portfolio sous forme de galerie */}
            <div className="portfolio-gallery">
                {sortedItems.map(item => (
                    <div
                        key={item._id}
                        className={`portfolio-item ${item.featured ? 'featured' : ''}`}
                        onClick={() => handleImageClick(item)}
                    >
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="portfolio-image"
                        />
                        <div className="portfolio-item-overlay">
                            <h3>{item.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal pour afficher les détails de l'élément sélectionné */}
            {selectedItem && (
                <div className="portfolio-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="close-modal" onClick={closeModal}>&times;</span>
                        <img
                            src={selectedItem.imageUrl}
                            alt={selectedItem.title}
                            className="modal-image"
                        />
                        <div className="modal-info">
                            <h3>{selectedItem.title}</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}