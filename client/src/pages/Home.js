import { Link } from 'react-router-dom';
import PortfolioGallery from '../components/PortfolioGallery';
import './Home.css';

/**
 * Page d'accueil.
 * Affiche une galerie de portfolio et des liens vers la boutique et les soins pour tatouages.
 * 
 * @returns {JSX.Element} - La page d'accueil.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function Home() {
  return (
    <div className="home-container">
      {/* Section d'introduction avec un titre et des boutons */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>MPP</h1>
          <p>Depuis 2009</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn primary-btn">
              Explorer la boutique
            </Link>
            <Link to="/soins" className="btn secondary-btn">
              Soins pour tatouages
            </Link>
          </div>
        </div>
      </section>

      {/* Section de galerie de portfolio */}
      <PortfolioGallery />

      {/* Section d'appel à l'action avec un lien vers la boutique */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt pour votre prochain tatouage?</h2>
          <p>Découvrez nos produits et conseils pour prendre soin de vos tatouages.</p>
          <Link to="/shop" className="btn primary-btn">
            Voir nos produits
          </Link>
        </div>
      </section>
    </div>
  );
}