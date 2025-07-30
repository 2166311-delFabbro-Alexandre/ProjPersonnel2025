import React, { useState, useEffect } from 'react';
import './PortfolioGallery.css';

export default function PortfolioGallery() {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

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
            setError('Impossible de charger le portfolio. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (item) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    if (loading) {
        return <div className="portfolio-loading">Chargement du portfolio...</div>;
    }

    if (error) {
        return <div className="portfolio-error">{error}</div>;
    }

    if (portfolioItems.length === 0) {
        return <div className="portfolio-empty">Aucun élément dans le portfolio pour le moment.</div>;
    }

    const filteredItems = portfolioItems.filter(item => item.featured || item.displayOrder > 0).sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <div className="portfolio-section">
            <h2 className="portfolio-title">Portfolio</h2>

            <div className="portfolio-gallery">
                {filteredItems.map(item => (
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