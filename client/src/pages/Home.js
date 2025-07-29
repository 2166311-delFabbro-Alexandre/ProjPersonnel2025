import { Link } from 'react-router-dom';
import PortfolioGallery from '../components/PortfolioGallery';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
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

      <PortfolioGallery />

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